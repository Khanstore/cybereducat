# -*- coding: utf-8 -*-

from odoo import fields, models, api, _
from odoo.exceptions import ValidationError
from datetime import date,datetime

class importAllStudent(models.Model):
    _name='education.import.previous.student'
    name=fields.Char('Namee')

    date=fields.Date(default=fields.Date.today)
    import_qty=fields.Integer('No of Student to Import')
    import_standard=fields.Many2one('education.class',"Import student Of")
    import_group=fields.Selection([('science','Science'),('Humanity','Humanity'),('Comm','Commerce')],'From Group')
    import_section=fields.Selection([('a','A'),('b','B'),('c','C'),('d','D')],'From Section')
    assign_class=fields.Many2one('education.class.division',"Assign Student to")
    students_to_assign=fields.One2many('education.application','import_id',"Student List")
    state=fields.Selection([(1,'draft'),(2,'done')],default='1')


    # @api.onchange('import_standard')
    # def get_student_to_import(self):
    #     for rec in self:
    #         if self.import_standard:
    #             applications=self.env['education.application'].search([('register_id.standard','=',self.import_standard)])
    #             if self.student_to_assign:
    #                 applications=self.env['education.application'].search([register_id('section','=',self.section),('group','=',self.group)])
    #



    @api.multi
    def import_students(self):
        applications=self.env['education.application'].search([('id','>','0')],order='id asc',limit=self.import_qty)
        for app in applications:
            if app.student_id:
                # verify student
                document_ids = self.env['education.documents'].search([('application_ref', '=', app.id)])
                # if not document_ids:
                #     raise ValidationError(_('No Documents provided'))
                app.write({
                    'state': 'verification'
                })
                # insert documents
                doc_details={ 'application_ref': app.id,
                              'document_name':1,
                              'has_hard_copy':False,
                              'reference':1
                              }
                documents=self.env['education.documents']
                document=documents.create(doc_details)
                document.write({
                    'verified_by': self.env.uid,
                    'verified_date': datetime.now().strftime("%Y-%m-%d"),
                    'state': 'done'
                })
                app.write({
                    'verified_by': self.env.uid,
                    'state': 'approve'
                })
                student=app.create_student()

