odoo.define('easy_pdf_creator.SidebarInherit', function (require) {
    'use strict';
    // ------
    var Sidebar = require('web.Sidebar');
    var data = require('web.data');
    var CrashManager = require('web.CrashManager');
    var core = require('web.core');
    var _t = core._t;

    // SideBar inherit
    Sidebar.include({
        init: function (parent, options) {
            this._super.apply(this, arguments);
            var item = {
                label: _t('EasyPrint'),
                callback: this.on_click_easy_print, // function,
                classname: 'oe_easy_print',
            };
            this.items['print'].push(item);
        },
        // Event
        on_click_easy_print: function(item) {
            var view = this.getParent();
            launch_easy_print(this, view); // function
        },
    });

    // to Python - Check pdf template
    function launch_easy_print(self, view) {
        var res_model = self.env.model;
        var res_id = self.env.activeIds[0];
        console.log('----data--', res_model, res_id);
        var template_id;
        var ds = new data.DataSet(self, 'pdf.template.generator');
        ds.call("search", [[
                ["model_id.model","=",res_model],
                ["name","=","default"] 
                ]])
            .done(function (template) {
                console.log('-----temp-----', template, res_model, res_id);
                if(template != false){
                    ds.call("print_template", [ template[0], res_id])
                            .then(function(result){
                                view.do_action(result);
                        });
                }else{
                    // Not found, Warning
                    new CrashManager().show_warning({data: {
                        exception_type: _t("Warning"),
                        message: _t("Not found template! Must be template name 'default'")
                    }});
                }

            });
    }
});
