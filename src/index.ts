import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware для обработки JSON
app.use(express.json())

// Home route - HTML
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Mock Device Server</title>
      </head>
      <body>
        <h1>Mock Device Server</h1>
        <p>API эндпоинты для мок-данных устройств</p>
        <ul>
          <li>GET /devices</li>
          <li>PUT /devices/cash-register/work-shift</li>
          <li>POST /devices/pos/reports/z</li>
          <li>POST /devices/cash-register/reports/x</li>
          <li>POST /devices/pos/reports/x</li>
          <li>GET /devices/cash-register/shift-totals</li>
          <li>POST /devices/pos/refunds</li>
          <li>POST /devices/pos/payments</li>
          <li>POST /devices/cash-register/receipts</li>
        </ul>
      </body>
    </html>
  `)
})

// 1. Получение списка устройств (GET запрос)
app.get('/devices', (req, res) => {
  console.log('GET /devices requested')

  const devices = [
    {
      "type": "cash-register",
      "details": {
        "isWorkShiftActive": true
      }
    },
    {
      "type": "pos-terminal",
      "details": {
        "isWorkShiftActive": true
      }
    }
  ]

  res.status(200).json(devices)
})

// 2. Открытие/закрытие смены кассового аппарата (PUT запрос)
app.put('/devices/cash-register/work-shift', (req, res) => {
  console.log('PUT /devices/cash-register/work-shift:', req.body)

  // Проверяем наличие isActive в теле запроса
  if (req.body.isActive === undefined) {
    return res.status(400).json({
      message: 'Поле isActive обязательно'
    })
  }

  // Мок-ответ при успешном открытии/закрытии смены
  res.status(200).json({
    success: true,
    message: req.body.isActive ? 'Смена открыта' : 'Смена закрыта',
    timestamp: new Date().toISOString(),
    shiftId: Math.floor(Math.random() * 10000)
  })
})

// 3. Z-отчет для POS (POST запрос)
app.post('/devices/pos/reports/z', (req, res) => {
  console.log('POST /devices/pos/reports/z requested')

  // Мок-ответ для Z-отчета
  res.status(200).json({
    success: true,
    reportType: 'Z',
    deviceType: 'POS',
    generatedAt: new Date().toISOString(),
    totals: {
      sales: Math.floor(Math.random() * 100000) / 100,
      refunds: Math.floor(Math.random() * 10000) / 100,
      transactions: Math.floor(Math.random() * 100)
    }
  })
})

// 4. X-отчет для кассового аппарата (POST запрос)
app.post('/devices/cash-register/reports/x', (req, res) => {
  console.log('POST /devices/cash-register/reports/x requested')

  // Мок-ответ для X-отчета кассового аппарата
  res.status(200).json({
    success: true,
    reportType: 'X',
    deviceType: 'CASH_REGISTER',
    generatedAt: new Date().toISOString(),
    shiftInfo: {
      isOpen: true,
      openedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      shiftNumber: Math.floor(Math.random() * 1000)
    },
    totals: {
      cash: Math.floor(Math.random() * 50000) / 100,
      electronic: Math.floor(Math.random() * 100000) / 100,
      total: Math.floor(Math.random() * 150000) / 100
    }
  })
})

// 5. X-отчет для POS (POST запрос)
app.post('/devices/pos/reports/x', (req, res) => {
  console.log('POST /devices/pos/reports/x requested')

  // Мок-ответ для X-отчета POS
  const mockData = {
    success: true,
    reportType: 'X',
    deviceType: 'POS',
    generatedAt: new Date().toISOString(),
    summary: {
      totalSales: Math.floor(Math.random() * 200000) / 100,
      totalRefunds: Math.floor(Math.random() * 5000) / 100,
      netSales: Math.floor(Math.random() * 195000) / 100,
      transactionCount: Math.floor(Math.random() * 150),
      averageTransaction: Math.floor(Math.random() * 1500) / 100
    },
    paymentMethods: [
      { type: 'CASH', amount: Math.floor(Math.random() * 50000) / 100 },
      { type: 'CARD', amount: Math.floor(Math.random() * 100000) / 100 },
      { type: 'MOBILE', amount: Math.floor(Math.random() * 50000) / 100 }
    ]
  }

  res.status(200).json(mockData)
})

// 6. Итоги смены для кассового аппарата (GET запрос)
app.get('/devices/cash-register/shift-totals', (req, res) => {
  console.log('GET /devices/cash-register/shift-totals requested')

  // Мок-данные итогов смены (как вы указали)
  const shiftTotals = {
    "incomes": {
      "cash": 200,
      "electronically": 4000.68
    },
    "refunds": {
      "cash": 100,
      "electronically": 1000
    }
  }

  res.status(200).json(shiftTotals)
})

// 7. Платежи через POS (POST запрос)
app.post('/devices/pos/payments', (req, res) => {
  console.log('POST /devices/pos/payments requested:', req.body)

  // Проверяем наличие суммы
  if (!req.body.amount || req.body.amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Неверная сумма платежа'
    })
  }

  // Мок-ответ для платежа через POS
  const paymentResponse = {
    "amount": 100.5,
    "slip": "Текстовое содержимое слипа",
    "transactionNumber": "1001324684"
  }

  res.status(200).json(paymentResponse)
})

// 8. Создание чека кассового аппарата (POST запрос)
app.post('/devices/cash-register/receipts', (req, res) => {
  console.log('POST /devices/cash-register/receipts requested:', req.body)

  // Проверяем наличие необходимых данных
  if (!req.body.total || req.body.total <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Неверная сумма чека'
    })
  }

  // Мок-ответ для чека кассового аппарата
  const receiptResponse = {
    "fiscalDocumentDateTime": "2022-08-18T15:44:00+03:00",
    "fiscalDocumentNumber": 25144,
    "fiscalDocumentSign": "908424925",
    "fiscalReceiptNumber": 312,
    "fnNumber": "9960440300757395",
    "fnsUrl": "www.nalog.gov.ru",
    "registrationNumber": "0004622719017597",
    "shiftNumber": 116,
    "total": 2000
  }

  // Можно обновить некоторые поля на основе запроса
  if (req.body.total) {
    receiptResponse.total = req.body.total
  }

  res.status(200).json(receiptResponse)
})

// 9. Возврат для POS (POST запрос)
app.post('/devices/pos/refunds', (req, res) => {
  console.log('POST /devices/pos/refunds requested:', req.body)

  const { amount, transactionNumber } = req.body

  // Валидация входных данных
  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Неверная сумма возврата'
    })
  }

  if (!transactionNumber) {
    return res.status(400).json({
      success: false,
      message: 'Номер транзакции обязателен'
    })
  }

  // Мок-ответ успешного возврата
  res.status(200).json({
    success: true,
    refundId: `REF_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    transactionNumber: transactionNumber,
    amount: amount,
    status: 'COMPLETED',
    processedAt: new Date().toISOString(),
    deviceId: 'POS_001',
    operator: 'mock_operator'
  })
})

// 10. Проверка здоровья сервера
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /devices',
      'PUT /devices/cash-register/work-shift',
      'GET /devices/cash-register/shift-totals',
      'POST /devices/pos/payments',
      'POST /devices/cash-register/receipts',
      'POST /devices/pos/refunds'
    ]
  })
})

// Обработка ошибок для несуществующих маршрутов
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /devices',
      'PUT /devices/cash-register/work-shift',
      'POST /devices/pos/reports/z',
      'POST /devices/cash-register/reports/x',
      'POST /devices/pos/reports/x',
      'GET /devices/cash-register/shift-totals',
      'POST /devices/pos/payments',
      'POST /devices/cash-register/receipts',
      'POST /devices/pos/refunds',
      'GET /healthz'
    ]
  })
})

export default app