# -*- coding: utf-8 -*-


from odoo import models, fields, api, _
from odoo.exceptions import UserError

class academicTranscript(models.Model):
    _name ='academic.transcript'
    _description='print academic transcript for selected exams'
    academic_year=fields.Many2one('education.academic.year',"Academic Year")
    exams=fields.Many2many('education.exam','transcript_id')
    specific_student=fields.Boolean('For a specific Student')
    student=fields.Many2one('education.student','Student')