var express = require('express');
var router = express.Router();
const app = express();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
//
app.use('/api/jobs', require('./jobs'));
app.use('/api/applications', require('./applications'));
app.use('/api/admin', require('./admin'));
app.use('/api/users', require('./users'));
app.use('/api/companies', require('./companies'));
app.use('/api/contact', require('./contact'));
app.use('/api/leads', require('./leads'));
app.use('/api/cv-upload', require('./cvUpload'));
module.exports = router;
