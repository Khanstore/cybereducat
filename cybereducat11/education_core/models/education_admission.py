# -*- coding: utf-8 -*-

from odoo import fields, models, api, _
from odoo.exceptions import ValidationError
from datetime import datetime

class admissionRegister(models.Model):
    _name='education.admission.register'
    name=fields.Char('Register Name')
    standard=fields.Many2one('education.class','Standard')
    academic_year=fields.Many2one('education.academic.year', "For the year")
    start_time = fields.Datetime(string='Application Starts on',default=lambda self: fields.datetime.now())
    end_time = fields.Datetime(string='Application ends on',default=lambda self: fields.datetime.now())
    active=fields.Boolean('Is active', default='True')