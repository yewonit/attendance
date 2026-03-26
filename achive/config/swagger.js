import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Church Attendance API',
      version: '1.0.0',
      description: '교회 출석 관리 시스템 API 문서',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '개발 서버',
      },
    ],
  },
  apis: [
    './router/*.js',
    './router/attendance/*.js',
    './router/auth/*.js',
    './router/churchOffice/*.js',
    './router/domainCtrl/*.js',
    './router/file/*.js',
    './router/organization/*.js',
    './router/role/*.js',
    './router/season/*.js',
    './router/user/*.js',
    './router/visitation/*.js'
  ],
};

const specs = swaggerJsdoc(options);

export default specs; 