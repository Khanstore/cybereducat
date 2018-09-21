odoo.define('easy_pdf_creator.html_editor', function (require) {
    'use strict';

    var AbstractField = require('web.AbstractField');
    var basic_fields = require('web.basic_fields');
    var transcoder = require('web_editor.transcoder');
    var TranslatableFieldMixin = basic_fields.TranslatableFieldMixin;
    var core = require('web.core');
    var session = require('web.session');
    var QWeb = core.qweb;
    var _t = core._t;
    var editor = require('web_editor.editor');
    var config = require('web.config');
    var widgets = require('web_editor.widget');
    var field_registry = require('web.field_registry');
    
    console.log('--------------inherited--JS-----------');

    function _config() {
        var config_e = {
            height: 180,
            //selector: ".oe_form_field_html_text textarea",
            browser_spellcheck: true,
            fontsize_formats: "8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 36pt",
            plugins: [
                'advlist autolink charmap textcolor',
                'searchreplace code fullscreen emoticons',
                'table paste code hr emoticons codesample wordcount'
            ],
            toolbar: 'insertfile undo redo | styleselect fontselect fontsizeselect | bold italic underline forecolor backcolor | alignleft aligncenter alignright | bullist numlist | outdent indent | odoo_link odoo_media table charmap emoticons codesample hr | fullscreen code ',
            menubar: false,
            extended_valid_elements: "iframe[src|frameborder|style|scrolling|class|width|height|name|align|table]",
            table_default_styles: {width: '100%'},
            setup: function (editor) {

                // Add a new button to call Odoo's LinkDialog
                editor.addButton('odoo_link', {
                    icon: "link",
                    tooltip: "Insert/edit link",
                    onclick: function () {
                        // Get the selection
                        var dom_selection = editor.selection;
                        dom_selection.select();
                        var $selected_node = $(dom_selection.getNode());
                        // Link info
                        var linkinfo = {
                            iniClassName: $selected_node.attr('class'),
                            isNewWindow: $selected_node.attr('target') == '_blank',
                            text: dom_selection.getContent(),
                            url: $selected_node.attr('href')
                        };
                        // Initialize Link Dialog
                        var link_dialog = new widgets.LinkDialog(editor, linkinfo);
                        // Display the Link Dialog
                        link_dialog.appendTo(document.body);
                        // On save
                        link_dialog.on("save", this, function (linkInfo) {
                            // Create the link
                            var $new_link = $("<a>");
                            $new_link.attr({
                                'class': linkInfo.className,
                                'href': linkInfo.url,
                                'target': linkInfo.isNewWindow ? '_blank' : '_self'
                            });
                            $new_link.text(linkInfo.text);
                            // Insert the link the selection
                            editor.insertContent($new_link[0].outerHTML);
                        });
                    },
                    stateSelector: "a[href]"
                });

                // Add a new button to call Odoo's MediaDialog
                editor.addButton("odoo_media", {
                    icon: "image",
                    tooltip: "Insert/edit image",
                    onclick: function () {
                        // Get the selection
                        var dom_selection = editor.selection;
                        dom_selection.select();
                        var selected_node = dom_selection.getNode();
                        // Initialize Media Dialog
                        var media_dialog = new widgets.MediaDialog(null, selected_node);
                        // Display the Media Dialog
                        media_dialog.appendTo(document.body);
                        // On save
                        media_dialog.on("saved", this, function (media) {
                            dom_selection.select();
                        });
                    },
                    stateSelector: "img:not([data-mce-object],[data-mce-placeholder]),figure.image"
                });
            },
            content_css: [
                '/web/static/lib/bootstrap/css/bootstrap.css',
                '/web/static/lib/fontawesome/css/font-awesome.css',
                '/web/static/src/less/mimetypes.less',
                '/easy_pdf_creator/static/styles/css/tinymce.css'],
            remove_trailing_brs: false,
            verify_html: false
        };
        if (session.debug) {
            //config.toolbar += 'code';
        }
        return config_e;
    }

    tinymce.baseURL = '/easy_pdf_creator/static/js/lib/tinymce/';
    tinymce.suffix = '.min';
    $('.oe_form_field_html_text textarea').livequery(function () {
        if ($(".modal-content .oe_form_editable").length || !$(".oe_form_readonly").length && !$(".modal-content .oe_form_readonly").length) {
            $(this).each(function () {
                try {
                    $(this).tinymce().remove();
                }
                catch (err) {
                }
                finally {
                    var config_e = _config();
                    $(this).tinymce(config_e);
                }
            });
        }
    });

    // Simple FieldTextHTML
    var FieldTextHtmlSimple = basic_fields.DebouncedField.extend(TranslatableFieldMixin, {
        className: 'oe_form_field oe_form_field_html_text',
        supportedFieldTypes: ['html'],

        start: function () {
            var def = this._super.apply(this, arguments);
            // this.$translate.remove();
            this.$translate = $();
            return def;
        },
        initialize_content: function () {
            var self = this;
            this.$textarea = this.$("textarea").val(this.get('value') || "<p><br/></p>");
            this.$textarea.css('opacity', 0);

            if (this.get("effective_readonly")) {
                this.$textarea.hide().after('<div class="note-editable"/>');
            } else {
                if (this.field.translate && this.view) {
                    $(QWeb.render('web_editor.FieldTextHtml.button.translate', {'widget': this}))
                        .appendTo(this.$('.note-toolbar'))
                        .on('click', this.on_translate);
                }
            }
            this.$content = this.$('.note-editable:first');

            $(".oe-view-manager-content").on("scroll", function () {
                $('.o_table_handler').remove();
            });

            this._super();
        },

        old_initialize_content: function () {
            var self = this;
            this.$textarea = this.$("textarea").val(this.get('value') || "<p><br/></p>");
            this.$textarea.css('opacity', 0);

            if (this.get("effective_readonly")) {
                this.$textarea.hide().after('<div class="mce-content-body "/>');
            } else {
                if (this.field.translate && this.view) {
                    $(QWeb.render('web_editor.FieldTextHtml.button.translate', {'widget': this}))
                        .appendTo(this.$('.note-toolbar'))
                        .on('click', this.on_translate);
                }
            }
            this.$content = this.$('.mce-content-body :first');

            $(".oe-view-manager-content").on("scroll", function () {
                $('.o_table_handler').remove();
            });

            this._super();
        },
        text_to_html: function (text) {
            // Clean text before converting to HTML
            var value = text || "";
            if (value.match(/^\s*$/)) {
                value = '<p><br/></p>';
            } else {
                value = "<p>" + value.split(/<br\/?>/).join("<br/></p><p>") + "</p>";
                value = value.replace(/<p><\/p>/g, '').replace('<p><p>', '<p>').replace('</p></p>', '</p>');
            }
            return value;
        },
        render_value: function () {
            // Render field's HTML to the editor
            var value = this.get('value');
            this.$textarea.val(value || '');
            this.$content.html(this.text_to_html(value));
        },
        is_false: function () {
            return !this.get('value') || this.get('value') === "<p><br/></p>" || !this.get('value').match(/\S/);
        },
        before_save: function () {
            // Before saving the record, set the HTML field value to the content of TinyMCE
            if (!this.get("effective_readonly")) {
                var $tinymce_body = tinymce.get(this.$textarea[0].id).$("#tinymce");
                if (this.nodeOptions['style-inline']) {
                    // Convert class to inline styles for email use
                    transcoder.classToStyle($tinymce_body);
                    // Convert font-awesome to images
                    transcoder.fontToImg($tinymce_body);
                }
                // Set the value of field
                this._setValue($tinymce_body.html());
            }
        },
        commitChanges: function () {
        // switch to WYSIWYG mode if currently in code mode to get all changes
        if (config.debug && this.mode === 'edit') {
            this.before_save();
            }
            this._super.apply(this, arguments);
        },
        destroy_content: function () {
            $(".oe-view-manager-content").off("scroll");
            this.$textarea.destroy();
            this._super();
        },
        // ----------
        isSet: function () {
            return this.value && this.value !== "<p><br/></p>" && this.value.match(/\S/);
        },
        reset: function (record, event) {
            this._reset(record, event);
            if (!event || event.target !== this) {
                if (this.mode === 'edit') {
                    this.$content.html(this._textToHtml(this.value));
                } else {
                    this._renderReadonly();
                }
            }
            return $.when();
        },
        _getValue: function () {
            if (this.nodeOptions['style-inline']) {
                transcoder.classToStyle(this.$content);
                transcoder.fontToImg(this.$content);
            }
            return this.$content.html();
        },
        _renderEdit: function () {
            this.$textarea = $('<textarea id="ta_tiny">'+this.value+'</textarea>');
            this.$textarea.appendTo(this.$el);
            var config_e = _config();
            this.$textarea.tinymce(config_e);
            this.$content = this.$('#ta_tiny');
            this.$content.html(this._textToHtml(this.value));
            // -----------
            // trigger a mouseup to refresh the editor toolbar
            this.$content.trigger('mouseup');
            if (this.nodeOptions['style-inline']) {
                transcoder.styleToClass(this.$content);
            }
            // reset the history (otherwise clicking on undo before editing the
            // value will empty the editor)
            var history = this.$content.data('NoteHistory');
            if (history) {
                history.reset();
            }
            this.$('.note-toolbar').append(this._renderTranslateButton());
        },
        /**
         * @override
         * @private
         */
        _renderReadonly: function () {
            var self = this;
            this.$el.empty();
            if (this.nodeOptions['style-inline']) {
                var $iframe = $('<iframe class="o_readonly"/>');
                $iframe.on('load', function () {
                    self.$content = $($iframe.contents()[0]).find("body");
                    self.$content.html(self._textToHtml(self.value));
                    self._resize();
                });
                $iframe.appendTo(this.$el);
            } else {
                this.$content = $('<div class="o_readonly"/>');
                this.$content.html(this._textToHtml(this.value));
                this.$content.appendTo(this.$el);
            }
        },
        /**
         * Sets the height of the iframe.
         *
         * @private
         */
        _resize: function () {
            var height = this.$content[0] ? this.$content[0].scrollHeight : 0;
            this.$('iframe').css('height', Math.max(30, Math.min(height, 500)) + 'px');
        },
        /**
         * @private
         * @param {string} text
         * @returns {string} the text converted to html
         */
        _textToHtml: function (text) {
            var value = text || "";
            try {
                $(text)[0].innerHTML; // crashes if text isn't html
            } catch (e) {
                if (value.match(/^\s*$/)) {
                    value = '<p><br/></p>';
                } else {
                    value = "<p>" + value.split(/<br\/?>/).join("<br/></p><p>") + "</p>";
                    value = value
                                .replace(/<p><\/p>/g, '')
                                .replace('<p><p>', '<p>')
                                .replace('<p><p ', '<p ')
                                .replace('</p></p>', '</p>');
                }
            }
            return value;
        },
        /**
         * @override
         * @private
         * @returns {jQueryElement}
         */
        _renderTranslateButton: function () {
            if (_t.database.multi_lang && this.field.translate && this.res_id) {
                return $(QWeb.render('web_editor.FieldTextHtml.button.translate', {widget: this}))
                    .on('click', this._onTranslate.bind(this));
            }
            return $();
        },

        // ---------
    });

    // FieldTextHTML
    var FieldTextHtml = AbstractField.extend({
        template: 'web_editor.FieldTextHtml',
        supportedFieldTypes: ['html'],

        willStart: function () {
            var self = this;
            return new Model('res.lang').call("search_read", [[['code', '!=', 'en_US']], ["name", "code"]]).then(function (res) {
                self.languages = res;
            });
        },
        start: function () {
            var self = this;

            this.callback = _.uniqueId('FieldTextHtml_');
            window.odoo[this.callback + "_editor"] = function (EditorBar) {
                setTimeout(function () {
                    self.on_editor_loaded(EditorBar);
                }, 0);
            };
            window.odoo[this.callback + "_content"] = function (EditorBar) {
                self.on_content_loaded();
            };
            window.odoo[this.callback + "_updown"] = null;
            window.odoo[this.callback + "_downup"] = function (value) {
                self._setValue(value);
                self.trigger('changed_value');
                self.resize();
            };

            // init jqery objects
            this.$iframe = this.$el.find('iframe');
            this.document = null;
            this.$body = $();
            this.$content = $();

            this.$iframe.css('min-height', 'calc(100vh - 360px)');

            // init resize
            this.resize = function resize() {
                if (self.get('effective_readonly')) {
                    return;
                }
                if ($("body").hasClass("o_form_FieldTextHtml_fullscreen")) {
                    self.$iframe.css('height', (document.body.clientHeight - self.$iframe.offset().top) + 'px');
                } else {
                    self.$iframe.css("height", (self.$body.find("#oe_snippets").length ? 500 : 300) + "px");
                }
            };
            $(window).on('resize', self.resize);

            var def = this._super.apply(this, arguments);
            this.$translate.remove();
            this.$translate = $();
            return def;
        },
        get_url: function (_attr) {
            var src = this.nodeOptions.editor_url ? this.nodeOptions.editor_url + "?" : "/web_editor/field/html?";
            var datarecord = this.view.get_fields_values();

            var attr = {
                'model': this.view.model,
                'field': this.name,
                'res_id': datarecord.id || '',
                'callback': this.callback
            };
            _attr = _attr || {};

            if (this.nodeOptions['style-inline']) {
                attr.inline_mode = 1;
            }
            if (this.nodeOptions.snippets) {
                attr.snippets = this.nodeOptions.snippets;
            }
            if (!this.get("effective_readonly")) {
                attr.enable_editor = 1;
            }
            if (this.field.translate) {
                attr.translatable = 1;
            }
            if (session.debug) {
                attr.debug = 1;
            }

            attr.lang = attr.enable_editor ? 'en_US' : this.session.user_context.lang;

            for (var k in _attr) {
                attr[k] = _attr[k];
            }

            for (var k in attr) {
                if (attr[k] !== null) {
                    src += "&" + k + "=" + (_.isBoolean(attr[k]) ? +attr[k] : attr[k]);
                }
            }

            delete datarecord[this.name];
            src += "&datarecord=" + encodeURIComponent(JSON.stringify(datarecord));

            return src;
        },
        old_initialize_content: function () {
            this.$el.closest('.modal-body').css('max-height', 'none');
            this.$iframe = this.$el.find('iframe');
            this.document = null;
            this.$body = $();
            this.$content = $();
            this.editor = false;
            window.odoo[this.callback + "_updown"] = null;
            this.$iframe.attr("src", this.get_url());
        },
        on_content_loaded: function () {
            var self = this;
            this.document = this.$iframe.contents()[0];
            this.$body = $("body", this.document);
            this.$content = this.$body.find("#editable_area");
            this._toggle_label();
            this.lang = this.$iframe.attr('src').match(/[?&]lang=([^&]+)/);
            this.lang = this.lang ? this.lang[1] : this.view.dataset.context.lang;
            this._dirty_flag = false;
            this.render_value();
            setTimeout(function () {
                self.add_button();
                setTimeout(self.resize, 0);
            }, 0);
        },
        on_editor_loaded: function (EditorBar) {
            var self = this;
            this.editor = EditorBar;
            if (this.get('value') && window.odoo[self.callback + "_updown"] && !(this.$content.html() || "").length) {
                this.render_value();
            }
            setTimeout(function () {
                setTimeout(self.resize, 0);
            }, 0);
        },
        add_button: function () {
            var self = this;
            var $to = this.$body.find("#web_editor-top-edit, #wrapwrap").first();

            $(QWeb.render('web_editor.FieldTextHtml.translate', {'widget': this}))
                .appendTo($to)
                .on('change', 'select', function () {
                    var lang = $(this).val();
                    var edit = !self.get("effective_readonly");
                    var trans = lang !== 'en_US';
                    self.$iframe.attr("src", self.get_url({
                        'edit_translations': edit && trans,
                        'enable_editor': edit && !trans,
                        'lang': lang
                    }));
                });

            $(QWeb.render('web_editor.FieldTextHtml.fullscreen'))
                .appendTo($to)
                .on('click', '.o_fullscreen', function () {
                    $("body").toggleClass("o_form_FieldTextHtml_fullscreen");
                    var full = $("body").hasClass("o_form_FieldTextHtml_fullscreen");
                    self.$iframe.parents().toggleClass('o_form_fullscreen_ancestor', full);
                    self.resize();
                });

            this.$body.on('click', '[data-action="cancel"]', function (event) {
                event.preventDefault();
                self.old_initialize_content();
            });
        },
        render: function () {
            if (this.lang !== this.view.dataset.context.lang || this.$iframe.attr('src').match(/[?&]edit_translations=1/)) {
                return;
            }
            var value = (this.get('value') || "").replace(/^<p[^>]*>(\s*|<br\/?>)<\/p>$/, '');
            if (!this.$content) {
                return;
            }
            if (!this.get("effective_readonly")) {
                if (window.odoo[this.callback + "_updown"]) {
                    window.odoo[this.callback + "_updown"](value, this.view.get_fields_values(), this.name);
                    this.resize();
                }
            } else {
                this.$content.html(value);
                if (this.$iframe[0].contentWindow) {
                    this.$iframe.css("height", (this.$body.height() + 20) + "px");
                }
            }
        },
        is_false: function () {
            return this.get('value') === false || !this.$content.html() || !this.$content.html().match(/\S/);
        },
        before_save: function () {
            if (this.lang !== 'en_US' && this.$body.find('.o_dirty').length) {
                this._setValue(this.view.datarecord[this.name]);
                this._dirty_flag = false;
                return this.editor.save();
            } else if (this._dirty_flag && this.editor && this.editor.buildingBlock) {
                this.editor.buildingBlock.clean_for_save();
                this._setValue(this.$content.html());
            }
        },
        commitChanges: function () {
            if (!this.loaded || this.mode === 'readonly') {
                return;
            }
            // switch to WYSIWYG mode if currently in code mode to get all changes
            if (config.debug && this.mode === 'edit' && this.editor.rte) {
                this.before_save();
            }
            this.editor.snippetsMenu.cleanForSave();
            this._setValue(this.$content.html());
            return this._super.apply(this, arguments);
        },
        destroy: function () {
            $(window).off('resize', self.resize);
            delete window.odoo[this.callback + "_editor"];
            delete window.odoo[this.callback + "_content"];
            delete window.odoo[this.callback + "_updown"];
            delete window.odoo[this.callback + "_downup"];
        }
    });

field_registry
    .add('html', FieldTextHtmlSimple)
    .add('html_frame', FieldTextHtml);

return {
    FieldTextHtmlSimple: FieldTextHtmlSimple,
    FieldTextHtml: FieldTextHtml,
};
});
