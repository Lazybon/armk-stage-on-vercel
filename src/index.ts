import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware для обработки CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400')
    return res.status(200).end()
  }

  next()
})

// Middleware для обработки JSON
app.use(express.json())

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`)
  next()
})

// Home route - HTML
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Mock Device Server</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; }
          ul { list-style-type: none; padding: 0; }
          li { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
          code { background: #e8e8e8; padding: 2px 6px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>Mock Device Server</h1>
        <p>API эндпоинты для мок-данных устройств (CORS разрешены)</p>
        <ul>
          <li><code>GET /devices</code></li>
          <li><code>PUT /devices/cash-register/work-shift</code></li>
          <li><code>POST /devices/pos/reports/z</code></li>
          <li><code>POST /devices/cash-register/reports/x</code></li>
          <li><code>POST /devices/pos/reports/x</code></li>
          <li><code>GET /devices/cash-register/shift-totals</code></li>
          <li><code>POST /devices/pos/refunds</code></li>
          <li><code>POST /devices/pos/payments</code></li>
          <li><code>POST /devices/cash-register/receipts</code></li>
          <li><code>POST /devices/cash-register/non-fiscals</code></li>
          <li><code>GET /healthz</code></li>
        </ul>
        <p>Для тестирования CORS все методы и заголовки разрешены.</p>
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

  if (req.body.isActive === undefined) {
    return res.status(400).json({
      message: 'Поле isActive обязательно'
    })
  }

  res.status(200).json({
    success: true,
    message: req.body.isActive ? 'Смена открыта' : 'Смена закрыта',
    timestamp: new Date().toISOString(),
    shiftId: Math.floor(Math.random() * 10000)
  })
})

// 3. Создание фискального чека (POST запрос)
app.post('/devices/cash-register/receipts', (req, res) => {
  console.log('POST /devices/cash-register/receipts requested')
  console.log('Payload:', JSON.stringify(req.body, null, 2))

  // Проверяем наличие обязательных полей
  if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Поле items обязательно и должно содержать массив позиций'
    })
  }

  if (!req.body.payment || !req.body.payment.sum || req.body.payment.sum <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Неверная сумма платежа'
    })
  }

  if (!req.body.type) {
    return res.status(400).json({
      success: false,
      message: 'Тип операции обязателен (sell, refund, etc.)'
    })
  }

  // Мок-ответ для фискального чека
  const receiptResponse = {
    "success": true,
    "fiscalDocumentDateTime": new Date().toISOString().replace('Z', '+03:00'),
    "fiscalDocumentNumber": Math.floor(Math.random() * 100000),
    "fiscalDocumentSign": Math.floor(Math.random() * 1000000000).toString(),
    "fiscalReceiptNumber": Math.floor(Math.random() * 1000),
    "fnNumber": "9960440300757395",
    "fnsUrl": "www.nalog.gov.ru",
    "registrationNumber": "0004622719017597",
    "shiftNumber": 116,
    "total": req.body.payment.sum || 1500,
    "receiptType": req.body.type,
    "fiscalMark": Math.floor(Math.random() * 1000000000000000).toString(),
    "fiscalSign": Math.floor(Math.random() * 1000000000).toString(),
    "processedAt": new Date().toISOString()
  }

  console.log('Response:', JSON.stringify(receiptResponse, null, 2))
  res.status(200).json(receiptResponse)
})

// 4. Печать нефискального документа (POST запрос)
app.post('/devices/cash-register/non-fiscals', (req, res) => {
  console.log('POST /devices/cash-register/non-fiscals requested')
  console.log('Payload items:', req.body?.length || 0)

  if (!Array.isArray(req.body) || req.body.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Тело запроса должно быть массивом элементов для печати'
    })
  }

  // Мок-ответ для нефискального документа
  const response = {
    "success": true,
    "message": "Нефискальный документ успешно напечатан",
    "printedAt": new Date().toISOString(),
    "itemsCount": req.body.length,
    "documentType": "non-fiscal",
    "deviceId": "cash-register-mock-001"
  }

  console.log('Non-fiscal response:', response)
  res.status(200).json(response)
})

// 5. Платежи через POS (POST запрос)
app.post('/devices/pos/payments', (req, res) => {
  console.log('POST /devices/pos/payments requested:', req.body)

  if (!req.body.amount || req.body.amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Неверная сумма платежа'
    })
  }

  const paymentResponse = {
    "amount": req.body.amount || 100.5,
    "slip": "Текстовое содержимое слипа\nДата операции: " + new Date().toLocaleString() +
        "\nСумма: " + (req.body.amount || 100.5) + " руб.\nТип операции: Оплата\nСтатус: Успешно",
    "transactionNumber": "100" + Math.floor(Math.random() * 10000000),
    "status": "COMPLETED",
    "processedAt": new Date().toISOString(),
    "authCode": Math.floor(Math.random() * 1000000).toString(),
    "rrn": Math.floor(Math.random() * 1000000000000).toString()
  }

  res.status(200).json(paymentResponse)
})

// 6. Возврат для POS (POST запрос)
app.post('/devices/pos/refunds', (req, res) => {
  console.log('POST /devices/pos/refunds requested:', req.body)

  const { amount, transactionNumber } = req.body

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

  res.status(200).json({
    success: true,
    refundId: `REF_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    transactionNumber: transactionNumber,
    amount: amount,
    status: 'COMPLETED',
    processedAt: new Date().toISOString(),
    deviceId: 'POS_001',
    operator: 'mock_operator',
    slip: "Слип возврата\nСумма: " + amount + " руб.\nТранзакция: " + transactionNumber
  })
})

// 7. Z-отчет для POS (POST запрос)
app.post('/devices/pos/reports/z', (req, res) => {
  console.log('POST /devices/pos/reports/z requested')

  res.status(200).json({
    success: true,
    reportType: 'Z',
    deviceType: 'POS',
    generatedAt: new Date().toISOString(),
    totals: {
      sales: Math.floor(Math.random() * 100000) / 100,
      refunds: Math.floor(Math.random() * 10000) / 100,
      transactions: Math.floor(Math.random() * 100)
    },
    shiftNumber: Math.floor(Math.random() * 1000),
    shiftClosedAt: new Date().toISOString()
  })
})

// 8. X-отчет для кассового аппарата (POST запрос)
app.post('/devices/cash-register/reports/x', (req, res) => {
  console.log('POST /devices/cash-register/reports/x requested')

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

// 9. X-отчет для POS (POST запрос)
app.post('/devices/pos/reports/x', (req, res) => {
  console.log('POST /devices/pos/reports/x requested')

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

// 10. Итоги смены для кассового аппарата (GET запрос)
app.get('/devices/cash-register/shift-totals', (req, res) => {
  console.log('GET /devices/cash-register/shift-totals requested')

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

// 11. Проверка здоровья сервера
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
      'POST /devices/cash-register/non-fiscals',
      'POST /devices/pos/refunds',
      'GET /healthz'
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
      'POST /devices/cash-register/non-fiscals',
      'POST /devices/pos/refunds',
      'GET /healthz'
    ]
  })
})

export default app