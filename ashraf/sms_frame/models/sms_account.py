# -*- coding: utf-8 -*-
from openerp import api, fields, models

class SmsAccount(models.Model):

    _name = "sms.account"
    
    name = fields.Char(string='Account Name', required=True)
    account_gateway_id = fields.Many2one('sms.gateway', string="Account Gateway", required=True)
    param_user = fields.Char(related="account_gateway_id.param_user", string="User Parameter")
    param_pass = fields.Char(related="account_gateway_id.param_password", string="Password Parameter")
    param_sid = fields.Char(related="account_gateway_id.param_sid", string="SID Parameter")
    user = fields.Char(string="User")
    password = fields.Char(string="Password")
    sid = fields.Char(string="SID")
    gateway_model = fields.Char(string="Gateway Model", related="account_gateway_id.gateway_model_name")

    def send_message(self, from_number, to_number, sms_content, my_model_name='', my_record_id=0, media=None, queued_sms_message=None, media_filename=None):
        """Send a message from this account"""
        return self.env[self.gateway_model].send_message(self.id, from_number, to_number, sms_content, my_model_name, my_record_id, media, queued_sms_message, media_filename=media_filename)
        

    @api.model
    def check_all_messages(self):
        """Check for any messages that might have been missed during server downtime"""
        my_accounts = self.env['sms.account'].search([])
        for sms_account in my_accounts:
            self.env[sms_account.account_gateway_id.gateway_model_name].check_messages(sms_account.id)