/*! jQuery Validation Plugin - v1.10.0 - 9/7/2012
 * https://github.com/jzaefferer/jquery-validation
 * Copyright (c) 2012 Jörn Zaefferer; Licensed MIT, GPL */

(function($) {

    $.extend($.fn, {
        // http://docs.jquery.com/Plugins/Validation/validate
        validate: function( options ) {

            // if nothing is selected, return nothing; can't chain anyway
            if (!this.length) {
                if (options && options.debug && window.console) {
                    console.warn( "nothing selected, can't validate, returning nothing" );
                }
                return;
            }

            // check if a validator for this form was already created
            var validator = $.data(this[0], 'validator');
            if ( validator ) {
                return validator;
            }

            // Add novalidate tag if HTML5.
            this.attr('novalidate', 'novalidate');

            validator = new $.validator( options, this[0] );
            $.data(this[0], 'validator', validator);

            if ( validator.settings.onsubmit ) {

                this.validateDelegate( ":submit", "click", function(ev) {
                    if ( validator.settings.submitHandler ) {
                        validator.submitButton = ev.target;
                    }
                    // allow suppressing validation by adding a cancel class to the submit button
                    if ( $(ev.target).hasClass('cancel') ) {
                        validator.cancelSubmit = true;
                    }
                });

                // validate the form on submit
                this.submit( function( event ) {
                    if ( validator.settings.debug ) {
                        // prevent form submit to be able to see console output
                        event.preventDefault();
                    }
                    function handle() {
                        var hidden;
                        if ( validator.settings.submitHandler ) {
                            if (validator.submitButton) {
                                // insert a hidden input as a replacement for the missing submit button
                                hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val(validator.submitButton.value).appendTo(validator.currentForm);
                            }
                            validator.settings.submitHandler.call( validator, validator.currentForm, event );
                            if (validator.submitButton) {
                                // and clean up afterwards; thanks to no-block-scope, hidden can be referenced
                                hidden.remove();
                            }
                            return false;
                        }
                        return true;
                    }

                    // prevent submit for invalid forms or custom submit handlers
                    if ( validator.cancelSubmit ) {
                        validator.cancelSubmit = false;
                        return handle();
                    }
                    if ( validator.form() ) {
                        if ( validator.pendingRequest ) {
                            validator.formSubmitted = true;
                            return false;
                        }
                        return handle();
                    } else {
                        validator.focusInvalid();
                        return false;
                    }
                });
            }

            return validator;
        },
        // http://docs.jquery.com/Plugins/Validation/valid
        valid: function() {
            if ( $(this[0]).is('form')) {
                return this.validate().form();
            } else {
                var valid = true;
                var validator = $(this[0].form).validate();
                this.each(function() {
                    valid &= validator.element(this);
                });
                return valid;
            }
        },
        // attributes: space seperated list of attributes to retrieve and remove
        removeAttrs: function(attributes) {
            var result = {},
                $element = this;
            $.each(attributes.split(/\s/), function(index, value) {
                result[value] = $element.attr(value);
                $element.removeAttr(value);
            });
            return result;
        },
        // http://docs.jquery.com/Plugins/Validation/rules
        rules: function(command, argument) {
            var element = this[0];

            if (command) {
                var settings = $.data(element.form, 'validator').settings;
                var staticRules = settings.rules;
                var existingRules = $.validator.staticRules(element);
                switch(command) {
                    case "add":
                        $.extend(existingRules, $.validator.normalizeRule(argument));
                        staticRules[element.name] = existingRules;
                        if (argument.messages) {
                            settings.messages[element.name] = $.extend( settings.messages[element.name], argument.messages );
                        }
                        break;
                    case "remove":
                        if (!argument) {
                            delete staticRules[element.name];
                            return existingRules;
                        }
                        var filtered = {};
                        $.each(argument.split(/\s/), function(index, method) {
                            filtered[method] = existingRules[method];
                            delete existingRules[method];
                        });
                        return filtered;
                }
            }

            var data = $.validator.normalizeRules(
                $.extend(
                    {},
                    $.validator.metadataRules(element),
                    $.validator.classRules(element),
                    $.validator.attributeRules(element),
                    $.validator.staticRules(element)
                ), element);

            // make sure required is at front
            if (data.required) {
                var param = data.required;
                delete data.required;
                data = $.extend({required: param}, data);
            }

            return data;
        }
    });

// Custom selectors
    $.extend($.expr[":"], {
        // http://docs.jquery.com/Plugins/Validation/blank
        blank: function(a) {return !$.trim("" + a.value);},
        // http://docs.jquery.com/Plugins/Validation/filled
        filled: function(a) {return !!$.trim("" + a.value);},
        // http://docs.jquery.com/Plugins/Validation/unchecked
        unchecked: function(a) {return !a.checked;}
    });

// constructor for validator
    $.validator = function( options, form ) {
        this.settings = $.extend( true, {}, $.validator.defaults, options );
        this.currentForm = form;
        this.init();
    };

    $.validator.format = function(source, params) {
        if ( arguments.length === 1 ) {
            return function() {
                var args = $.makeArray(arguments);
                args.unshift(source);
                return $.validator.format.apply( this, args );
            };
        }
        if ( arguments.length > 2 && params.constructor !== Array  ) {
            params = $.makeArray(arguments).slice(1);
        }
        if ( params.constructor !== Array ) {
            params = [ params ];
        }
        $.each(params, function(i, n) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
        });
        return source;
    };

    $.extend($.validator, {

        defaults: {
            messages: {},
            groups: {},
            rules: {},
            errorClass: "error",
            validClass: "valid",
            errorElement: "label",
            focusInvalid: true,
            errorContainer: $( [] ),
            errorLabelContainer: $( [] ),
            onsubmit: true,
            ignore: ":hidden",
            ignoreTitle: false,
            onfocusin: function(element, event) {
                this.lastActive = element;

                // hide error label and remove error class on focus if enabled
                if ( this.settings.focusCleanup && !this.blockFocusCleanup ) {
                    if ( this.settings.unhighlight ) {
                        this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
                    }
                    this.addWrapper(this.errorsFor(element)).hide();
                }
            },
            onfocusout: function(element, event) {
                if ( !this.checkable(element) && (element.name in this.submitted || !this.optional(element)) ) {
                    this.element(element);
                }
            },
            onblur: function(element, event) {
                if ( event.which === 9 && this.elementValue(element) === '' ) {
                    return;
                } else if ( element.name in this.submitted || element === this.lastActive ) {
                    this.element(element);
                }
            },
            onclick: function(element, event) {
                // click on selects, radiobuttons and checkboxes
                if ( element.name in this.submitted ) {
                    this.element(element);
                }
                // or option elements, check parent select in that case
                else if (element.parentNode.name in this.submitted) {
                    this.element(element.parentNode);
                }
            },
            highlight: function(element, errorClass, validClass) {
                if (element.type === 'radio') {
                    this.findByName(element.name).addClass(errorClass).removeClass(validClass);
                } else {
                    $(element).addClass(errorClass).removeClass(validClass);
                }
            },
            unhighlight: function(element, errorClass, validClass) {
                if (element.type === 'radio') {
                    this.findByName(element.name).removeClass(errorClass).addClass(validClass);
                } else {
                    $(element).removeClass(errorClass).addClass(validClass);
                }
            }
        },

        // http://docs.jquery.com/Plugins/Validation/Validator/setDefaults
        setDefaults: function(settings) {
            $.extend( $.validator.defaults, settings );
        },

        messages: {
            required: "This field is required.",
            remote: "Please fix this field.",
            email: "Please enter a valid email address.",
            url: "Please enter a valid URL.",
            date: "Please enter a valid date.",
            dateISO: "Please enter a valid date (ISO).",
            number: "Please enter a valid number.",
            digits: "Please enter only digits.",
            creditcard: "Please enter a valid credit card number.",
            equalTo: "Please enter the same value again.",
            maxlength: $.validator.format("Please enter no more than {0} characters."),
            minlength: $.validator.format("Este dato debe contener mas de {0} car&aacuteacteres."),
            rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
            range: $.validator.format("Please enter a value between {0} and {1}."),
            max: $.validator.format("Please enter a value less than or equal to {0}."),
            min: $.validator.format("Please enter a value greater than or equal to {0}.")
        },

        autoCreateRanges: false,

        prototype: {

            init: function() {
                this.labelContainer = $(this.settings.errorLabelContainer);
                this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
                this.containers = $(this.settings.errorContainer).add( this.settings.errorLabelContainer );
                this.submitted = {};
                this.valueCache = {};
                this.pendingRequest = 0;
                this.pending = {};
                this.invalid = {};
                this.reset();

                var groups = (this.groups = {});
                $.each(this.settings.groups, function(key, value) {
                    $.each(value.split(/\s/), function(index, name) {
                        groups[name] = key;
                    });
                });
                var rules = this.settings.rules;
                $.each(rules, function(key, value) {
                    rules[key] = $.validator.normalizeRule(value);
                });

                function delegate(event) {
                    var validator = $.data(this[0].form, "validator"),
                        eventType = "on" + event.type.replace(/^validate/, "");
                    if (validator.settings[eventType]) {
                        validator.settings[eventType].call(validator, this[0], event);
                    }
                }
                $(this.currentForm)
                    .validateDelegate(":text, [type='password'], [type='file'], select, textarea, " +
                    "[type='number'], [type='search'] ,[type='tel'], [type='url'], " +
                    "[type='email'], [type='datetime'], [type='date'], [type='month'], " +
                    "[type='week'], [type='time'], [type='datetime-local'], " +
                    "[type='range'], [type='color'] ",
                    "focusin focusout blur", delegate)
                    .validateDelegate("[type='radio'], [type='checkbox'], select, option", "click", delegate);

                if (this.settings.invalidHandler) {
                    $(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
                }
            },

            // http://docs.jquery.com/Plugins/Validation/Validator/form
            form: function() {
                this.checkForm();
                $.extend(this.submitted, this.errorMap);
                this.invalid = $.extend({}, this.errorMap);
                if (!this.valid()) {
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                }
                this.showErrors();
                return this.valid();
            },

            checkForm: function() {
                this.prepareForm();
                for ( var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++ ) {
                    this.check( elements[i] );
                }
                return this.valid();
            },

            // http://docs.jquery.com/Plugins/Validation/Validator/element
            element: function( element ) {
                element = this.validationTargetFor( this.clean( element ) );
                this.lastElement = element;
                this.prepareElement( element );
                this.currentElements = $(element);
                var result = this.check( element ) !== false;
                if (result) {
                    delete this.invalid[element.name];
                } else {
                    this.invalid[element.name] = true;
                }
                if ( !this.numberOfInvalids() ) {
                    // Hide error containers on last error
                    this.toHide = this.toHide.add( this.containers );
                }
                this.showErrors();
                return result;
            },

            // http://docs.jquery.com/Plugins/Validation/Validator/showErrors
            showErrors: function(errors) {
                if(errors) {
                    // add items to error list and map
                    $.extend( this.errorMap, errors );
                    this.errorList = [];
                    for ( var name in errors ) {
                        this.errorList.push({
                            message: errors[name],
                            element: this.findByName(name)[0]
                        });
                    }
                    // remove items from success list
                    this.successList = $.grep( this.successList, function(element) {
                        return !(element.name in errors);
                    });
                }
                if (this.settings.showErrors) {
                    this.settings.showErrors.call( this, this.errorMap, this.errorList );
                } else {
                    this.defaultShowErrors();
                }
            },

            // http://docs.jquery.com/Plugins/Validation/Validator/resetForm
            resetForm: function() {
                if ( $.fn.resetForm ) {
                    $( this.currentForm ).resetForm();
                }
                this.submitted = {};
                this.lastElement = null;
                this.prepareForm();
                this.hideErrors();
                this.elements().removeClass( this.settings.errorClass ).removeData( "previousValue" );
            },

            numberOfInvalids: function() {
                return this.objectLength(this.invalid);
            },

            objectLength: function( obj ) {
                var count = 0;
                for ( var i in obj ) {
                    count++;
                }
                return count;
            },

            hideErrors: function() {
                this.addWrapper( this.toHide ).hide();
            },

            valid: function() {
                return this.size() === 0;
            },

            size: function() {
                return this.errorList.length;
            },

            focusInvalid: function() {
                if( this.settings.focusInvalid ) {
                    try {
                        $(this.findLastActive() || this.errorList.length && this.errorList[0].element || [])
                            .filter(":visible")
                            .focus()
                            // manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
                            .trigger("focusin");
                    } catch(e) {
                        // ignore IE throwing errors when focusing hidden elements
                    }
                }
            },

            findLastActive: function() {
                var lastActive = this.lastActive;
                return lastActive && $.grep(this.errorList, function(n) {
                    return n.element.name === lastActive.name;
                }).length === 1 && lastActive;
            },

            elements: function() {
                var validator = this,
                    rulesCache = {};

                // select all valid inputs inside the form (no submit or reset buttons)
                return $(this.currentForm)
                    .find("input, select, textarea")
                    .not(":submit, :reset, :image, [disabled]")
                    .not( this.settings.ignore )
                    .filter(function() {
                        if ( !this.name && validator.settings.debug && window.console ) {
                            console.error( "%o has no name assigned", this);
                        }

                        // select only the first element for each name, and only those with rules specified
                        if ( this.name in rulesCache || !validator.objectLength($(this).rules()) ) {
                            return false;
                        }

                        rulesCache[this.name] = true;
                        return true;
                    });
            },

            clean: function( selector ) {
                return $( selector )[0];
            },

            errors: function() {
                var errorClass = this.settings.errorClass.replace(' ', '.');
                return $( this.settings.errorElement + "." + errorClass, this.errorContext );
            },

            reset: function() {
                this.successList = [];
                this.errorList = [];
                this.errorMap = {};
                this.toShow = $([]);
                this.toHide = $([]);
                this.currentElements = $([]);
            },

            prepareForm: function() {
                this.reset();
                this.toHide = this.errors().add( this.containers );
            },

            prepareElement: function( element ) {
                this.reset();
                this.toHide = this.errorsFor(element);
            },

            elementValue: function( element ) {
                var type = $(element).attr('type'),
                    val = $(element).val();

                if ( type === 'radio' || type === 'checkbox' ) {
                    return $('input[name="' + $(element).attr('name') + '"]:checked').val();
                }

                if ( typeof val === 'string' ) {
                    return val.replace(/\r/g, "");
                }
                return val;
            },

            check: function( element ) {
                element = this.validationTargetFor( this.clean( element ) );

                var rules = $(element).rules();
                var dependencyMismatch = false;
                var val = this.elementValue(element);
                var result;

                for (var method in rules ) {
                    var rule = { method: method, parameters: rules[method] };
                    try {

                        result = $.validator.methods[method].call( this, val, element, rule.parameters );

                        // if a method indicates that the field is optional and therefore valid,
                        // don't mark it as valid when there are no other rules
                        if ( result === "dependency-mismatch" ) {
                            dependencyMismatch = true;
                            continue;
                        }
                        dependencyMismatch = false;

                        if ( result === "pending" ) {
                            this.toHide = this.toHide.not( this.errorsFor(element) );
                            return;
                        }

                        if( !result ) {
                            this.formatAndAdd( element, rule );
                            return false;
                        }
                    } catch(e) {
                        if ( this.settings.debug && window.console ) {
                            console.log("exception occured when checking element " + element.id + ", check the '" + rule.method + "' method", e);
                        }
                        throw e;
                    }
                }
                if (dependencyMismatch) {
                    return;
                }
                if ( this.objectLength(rules) ) {
                    this.successList.push(element);
                }
                return true;
            },

            // return the custom message for the given element and validation method
            // specified in the element's "messages" metadata
            customMetaMessage: function(element, method) {
                if (!$.metadata) {
                    return;
                }
                var meta = this.settings.meta ? $(element).metadata()[this.settings.meta] : $(element).metadata();
                return meta && meta.messages && meta.messages[method];
            },

            // return the custom message for the given element and validation method
            // specified in the element's HTML5 data attribute
            customDataMessage: function(element, method) {
                return $(element).data('msg-' + method.toLowerCase()) || (element.attributes && $(element).attr('data-msg-' + method.toLowerCase()));
            },

            // return the custom message for the given element name and validation method
            customMessage: function( name, method ) {
                var m = this.settings.messages[name];
                return m && (m.constructor === String ? m : m[method]);
            },

            // return the first defined argument, allowing empty strings
            findDefined: function() {
                for(var i = 0; i < arguments.length; i++) {
                    if (arguments[i] !== undefined) {
                        return arguments[i];
                    }
                }
                return undefined;
            },

            defaultMessage: function( element, method) {
                return this.findDefined(
                    this.customMessage( element.name, method ),
                    this.customDataMessage( element, method ),
                    this.customMetaMessage( element, method ),
                    // title is never undefined, so handle empty string as undefined
                    !this.settings.ignoreTitle && element.title || undefined,
                    $.validator.messages[method],
                    "<strong>Warning: No message defined for " + element.name + "</strong>"
                );
            },

            formatAndAdd: function( element, rule ) {
                var message = this.defaultMessage( element, rule.method ),
                    theregex = /\$?\{(\d+)\}/g;
                if ( typeof message === "function" ) {
                    message = message.call(this, rule.parameters, element);
                } else if (theregex.test(message)) {
                    message = $.validator.format(message.replace(theregex, '{$1}'), rule.parameters);
                }
                this.errorList.push({
                    message: message,
                    element: element
                });

                this.errorMap[element.name] = message;
                this.submitted[element.name] = message;
            },

            addWrapper: function(toToggle) {
                if ( this.settings.wrapper ) {
                    toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
                }
                return toToggle;
            },

            defaultShowErrors: function() {
                var i, elements;
                for ( i = 0; this.errorList[i]; i++ ) {
                    var error = this.errorList[i];
                    if ( this.settings.highlight ) {
                        this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
                    }
                    this.showLabel( error.element, error.message );
                }
                if( this.errorList.length ) {
                    this.toShow = this.toShow.add( this.containers );
                }
                if (this.settings.success) {
                    for ( i = 0; this.successList[i]; i++ ) {
                        this.showLabel( this.successList[i] );
                    }
                }
                if (this.settings.unhighlight) {
                    for ( i = 0, elements = this.validElements(); elements[i]; i++ ) {
                        this.settings.unhighlight.call( this, elements[i], this.settings.errorClass, this.settings.validClass );
                    }
                }
                this.toHide = this.toHide.not( this.toShow );
                this.hideErrors();
                this.addWrapper( this.toShow ).show();
            },

            validElements: function() {
                return this.currentElements.not(this.invalidElements());
            },

            invalidElements: function() {
                return $(this.errorList).map(function() {
                    return this.element;
                });
            },

            showLabel: function(element, message) {
                var label = this.errorsFor( element );
                if ( label.length ) {
                    // refresh error/success class
                    label.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );

                    // check if we have a generated label, replace the message then
                    if ( label.attr("generated") ) {
                        label.html(message);
                    }
                } else {
                    // create label
                    label = $("<" + this.settings.errorElement + "/>")
                        .attr({"for":  this.idOrName(element), generated: true})
                        .addClass(this.settings.errorClass)
                        .html(message || "");
                    if ( this.settings.wrapper ) {
                        // make sure the element is visible, even in IE
                        // actually showing the wrapped element is handled elsewhere
                        label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
                    }
                    if ( !this.labelContainer.append(label).length ) {
                        if ( this.settings.errorPlacement ) {
                            this.settings.errorPlacement(label, $(element) );
                        } else {
                            label.insertAfter(element);
                        }
                    }
                }
                if ( !message && this.settings.success ) {
                    label.text("");
                    if ( typeof this.settings.success === "string" ) {
                        label.addClass( this.settings.success );
                    } else {
                        this.settings.success( label, element );
                    }
                }
                this.toShow = this.toShow.add(label);
            },

            errorsFor: function(element) {
                var name = this.idOrName(element);
                return this.errors().filter(function() {
                    return $(this).attr('for') === name;
                });
            },

            idOrName: function(element) {
                return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
            },

            validationTargetFor: function(element) {
                // if radio/checkbox, validate first element in group instead
                if (this.checkable(element)) {
                    element = this.findByName( element.name ).not(this.settings.ignore)[0];
                }
                return element;
            },

            checkable: function( element ) {
                return (/radio|checkbox/i).test(element.type);
            },

            findByName: function( name ) {
                return $(this.currentForm).find('[name="' + name + '"]');
            },

            getLength: function(value, element) {
                switch( element.nodeName.toLowerCase() ) {
                    case 'select':
                        return $("option:selected", element).length;
                    case 'input':
                        if( this.checkable( element) ) {
                            return this.findByName(element.name).filter(':checked').length;
                        }
                }
                return value.length;
            },

            depend: function(param, element) {
                return this.dependTypes[typeof param] ? this.dependTypes[typeof param](param, element) : true;
            },

            dependTypes: {
                "boolean": function(param, element) {
                    return param;
                },
                "string": function(param, element) {
                    return !!$(param, element.form).length;
                },
                "function": function(param, element) {
                    return param(element);
                }
            },

            optional: function(element) {
                var val = this.elementValue(element);
                return !$.validator.methods.required.call(this, val, element) && "dependency-mismatch";
            },

            startRequest: function(element) {
                if (!this.pending[element.name]) {
                    this.pendingRequest++;
                    this.pending[element.name] = true;
                }
            },

            stopRequest: function(element, valid) {
                this.pendingRequest--;
                // sometimes synchronization fails, make sure pendingRequest is never < 0
                if (this.pendingRequest < 0) {
                    this.pendingRequest = 0;
                }
                delete this.pending[element.name];
                if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
                    $(this.currentForm).submit();
                    this.formSubmitted = false;
                } else if (!valid && this.pendingRequest === 0 && this.formSubmitted) {
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                    this.formSubmitted = false;
                }
            },

            previousValue: function(element) {
                return $.data(element, "previousValue") || $.data(element, "previousValue", {
                    old: null,
                    valid: true,
                    message: this.defaultMessage( element, "remote" )
                });
            }

        },

        classRuleSettings: {
            required: {required: true},
            email: {email: true},
            url: {url: true},
            date: {date: true},
            dateISO: {dateISO: true},
            number: {number: true},
            digits: {digits: true},
            creditcard: {creditcard: true}
        },

        addClassRules: function(className, rules) {
            if ( className.constructor === String ) {
                this.classRuleSettings[className] = rules;
            } else {
                $.extend(this.classRuleSettings, className);
            }
        },

        classRules: function(element) {
            var rules = {};
            var classes = $(element).attr('class');
            if ( classes ) {
                $.each(classes.split(' '), function() {
                    if (this in $.validator.classRuleSettings) {
                        $.extend(rules, $.validator.classRuleSettings[this]);
                    }
                });
            }
            return rules;
        },

        attributeRules: function(element) {
            var rules = {};
            var $element = $(element);

            for (var method in $.validator.methods) {
                var value;

                // support for <input required> in both html5 and older browsers
                if (method === 'required') {
                    value = $element.get(0).getAttribute(method);
                    // Some browsers return an empty string for the required attribute
                    // and non-HTML5 browsers might have required="" markup
                    if (value === "") {
                        value = true;
                    }
                    // force non-HTML5 browsers to return bool
                    value = !!value;
                } else {
                    value = $element.attr(method);
                }

                if (value) {
                    rules[method] = value;
                } else if ($element[0].getAttribute("type") === method) {
                    rules[method] = true;
                }
            }

            // maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
            if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
                delete rules.maxlength;
            }

            return rules;
        },

        metadataRules: function(element) {
            if (!$.metadata) {
                return {};
            }

            var meta = $.data(element.form, 'validator').settings.meta;
            return meta ?
                $(element).metadata()[meta] :
                $(element).metadata();
        },

        staticRules: function(element) {
            var rules = {};
            var validator = $.data(element.form, 'validator');
            if (validator.settings.rules) {
                rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
            }
            return rules;
        },

        normalizeRules: function(rules, element) {
            // handle dependency check
            $.each(rules, function(prop, val) {
                // ignore rule when param is explicitly false, eg. required:false
                if (val === false) {
                    delete rules[prop];
                    return;
                }
                if (val.param || val.depends) {
                    var keepRule = true;
                    switch (typeof val.depends) {
                        case "string":
                            keepRule = !!$(val.depends, element.form).length;
                            break;
                        case "function":
                            keepRule = val.depends.call(element, element);
                            break;
                    }
                    if (keepRule) {
                        rules[prop] = val.param !== undefined ? val.param : true;
                    } else {
                        delete rules[prop];
                    }
                }
            });

            // evaluate parameters
            $.each(rules, function(rule, parameter) {
                rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
            });

            // clean number parameters
            $.each(['minlength', 'maxlength', 'min', 'max'], function() {
                if (rules[this]) {
                    rules[this] = Number(rules[this]);
                }
            });
            $.each(['rangelength', 'range'], function() {
                if (rules[this]) {
                    rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
                }
            });

            if ($.validator.autoCreateRanges) {
                // auto-create ranges
                if (rules.min && rules.max) {
                    rules.range = [rules.min, rules.max];
                    delete rules.min;
                    delete rules.max;
                }
                if (rules.minlength && rules.maxlength) {
                    rules.rangelength = [rules.minlength, rules.maxlength];
                    delete rules.minlength;
                    delete rules.maxlength;
                }
            }

            // To support custom messages in metadata ignore rule methods titled "messages"
            if (rules.messages) {
                delete rules.messages;
            }

            return rules;
        },

        // Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
        normalizeRule: function(data) {
            if( typeof data === "string" ) {
                var transformed = {};
                $.each(data.split(/\s/), function() {
                    transformed[this] = true;
                });
                data = transformed;
            }
            return data;
        },

        // http://docs.jquery.com/Plugins/Validation/Validator/addMethod
        addMethod: function(name, method, message) {
            $.validator.methods[name] = method;
            $.validator.messages[name] = message !== undefined ? message : $.validator.messages[name];
            if (method.length < 3) {
                $.validator.addClassRules(name, $.validator.normalizeRule(name));
            }
        },

        methods: {

            // http://docs.jquery.com/Plugins/Validation/Methods/required
            required: function(value, element, param) {
                // check if dependency is met
                if ( !this.depend(param, element) ) {
                    return "dependency-mismatch";
                }
                if ( element.nodeName.toLowerCase() === "select" ) {
                    // could be an array for select-multiple or a string, both are fine this way
                    var val = $(element).val();
                    return val && val.length > 0;
                }
                if ( this.checkable(element) ) {
                    return this.getLength(value, element) > 0;
                }
                return $.trim(value).length > 0;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/remote
            remote: function(value, element, param) {
                if ( this.optional(element) ) {
                    return "dependency-mismatch";
                }

                var previous = this.previousValue(element);
                if (!this.settings.messages[element.name] ) {
                    this.settings.messages[element.name] = {};
                }
                previous.originalMessage = this.settings.messages[element.name].remote;
                this.settings.messages[element.name].remote = previous.message;

                param = typeof param === "string" && {url:param} || param;

                if ( this.pending[element.name] ) {
                    return "pending";
                }
                if ( previous.old === value ) {
                    return previous.valid;
                }

                previous.old = value;
                var validator = this;
                this.startRequest(element);
                var data = {};
                data[element.name] = value;
                $.ajax($.extend(true, {
                    url: param,
                    mode: "abort",
                    port: "validate" + element.name,
                    dataType: "json",
                    data: data,
                    success: function(response) {
                        validator.settings.messages[element.name].remote = previous.originalMessage;
                        var valid = response === true || response === "true";
                        if ( valid ) {
                            var submitted = validator.formSubmitted;
                            validator.prepareElement(element);
                            validator.formSubmitted = submitted;
                            validator.successList.push(element);
                            delete validator.invalid[element.name];
                            validator.showErrors();
                        } else {
                            var errors = {};
                            var message = response || validator.defaultMessage( element, "remote" );
                            errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
                            validator.invalid[element.name] = true;
                            validator.showErrors(errors);
                        }
                        previous.valid = valid;
                        validator.stopRequest(element, valid);
                    }
                }, param));
                return "pending";
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/minlength
            minlength: function(value, element, param) {
                var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || length >= param;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/maxlength
            maxlength: function(value, element, param) {
                var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || length <= param;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/rangelength
            rangelength: function(value, element, param) {
                var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || ( length >= param[0] && length <= param[1] );
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/min
            min: function( value, element, param ) {
                return this.optional(element) || value >= param;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/max
            max: function( value, element, param ) {
                return this.optional(element) || value <= param;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/range
            range: function( value, element, param ) {
                return this.optional(element) || ( value >= param[0] && value <= param[1] );
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/email
            email: function(value, element) {
                // contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
                return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/url
            url: function(value, element) {
                // contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
                return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/date
            date: function(value, element) {
                return this.optional(element) || !/Invalid|NaN/.test(new Date(value));
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/dateISO
            dateISO: function(value, element) {
                return this.optional(element) || /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/number
            number: function(value, element) {
                return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/digits
            digits: function(value, element) {
                return this.optional(element) || /^\d+$/.test(value);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/creditcard
            // based on http://en.wikipedia.org/wiki/Luhn
            creditcard: function(value, element) {
                if ( this.optional(element) ) {
                    return "dependency-mismatch";
                }
                // accept only spaces, digits and dashes
                if (/[^0-9 \-]+/.test(value)) {
                    return false;
                }
                var nCheck = 0,
                    nDigit = 0,
                    bEven = false;

                value = value.replace(/\D/g, "");

                for (var n = value.length - 1; n >= 0; n--) {
                    var cDigit = value.charAt(n);
                    nDigit = parseInt(cDigit, 10);
                    if (bEven) {
                        if ((nDigit *= 2) > 9) {
                            nDigit -= 9;
                        }
                    }
                    nCheck += nDigit;
                    bEven = !bEven;
                }

                return (nCheck % 10) === 0;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/equalTo
            equalTo: function(value, element, param) {
                // bind to the blur event of the target in order to revalidate whenever the target field is updated
                // TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
                var target = $(param);
                if (this.settings.onfocusout) {
                    target.unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
                        $(element).valid();
                    });
                }
                return value === target.val();
            },
			equalToRFC: function(value, element) {
			var target = $('#rfc');
			if (this.settings.onfocusout) {
						  target.unbind(".validate-equalToRFC").bind("blur.validate-equalToRFC", function() {
									$(element).valid();
						  });
			   }
			target=target.val()+"";
			return value.substring(0,10).toUpperCase() === target.substring(0,10).toUpperCase();
}

        }

    });

// deprecated, use $.validator.format instead
    $.format = $.validator.format;

}(jQuery));

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()
(function($) {
    var pendingRequests = {};
    // Use a prefilter if available (1.5+)
    if ( $.ajaxPrefilter ) {
        $.ajaxPrefilter(function(settings, _, xhr) {
            var port = settings.port;
            if (settings.mode === "abort") {
                if ( pendingRequests[port] ) {
                    pendingRequests[port].abort();
                }
                pendingRequests[port] = xhr;
            }
        });
    } else {
        // Proxy ajax
        var ajax = $.ajax;
        $.ajax = function(settings) {
            var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
                port = ( "port" in settings ? settings : $.ajaxSettings ).port;
            if (mode === "abort") {
                if ( pendingRequests[port] ) {
                    pendingRequests[port].abort();
                }
                return (pendingRequests[port] = ajax.apply(this, arguments));
            }
            return ajax.apply(this, arguments);
        };
    }
}(jQuery));

// provides cross-browser focusin and focusout events
// IE has native support, in other browsers, use event caputuring (neither bubbles)

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target
(function($) {
    // only implement if not provided by jQuery core (since 1.4)
    // TODO verify if jQuery 1.4's implementation is compatible with older jQuery special-event APIs
    if (!jQuery.event.special.focusin && !jQuery.event.special.focusout && document.addEventListener) {
        $.each({
            focus: 'focusin',
            blur: 'focusout'
        }, function( original, fix ){
            $.event.special[fix] = {
                setup:function() {
                    this.addEventListener( original, handler, true );
                },
                teardown:function() {
                    this.removeEventListener( original, handler, true );
                },
                handler: function(e) {
                    var args = arguments;
                    args[0] = $.event.fix(e);
                    args[0].type = fix;
                    return $.event.handle.apply(this, args);
                }
            };
            function handler(e) {
                e = $.event.fix(e);
                e.type = fix;
                return $.event.handle.call(this, e);
            }
        });
    }
    $.extend($.fn, {
        validateDelegate: function(delegate, type, handler) {
            return this.bind(type, function(event) {
                var target = $(event.target);
                if (target.is(delegate)) {
                    return handler.apply(target, arguments);
                }
            });
        }
    });
}(jQuery));

jQuery.validator.messages = {
    required: "Este campo es obligatorio.",
    requiredMail: "Debes ingresar un correo electr&oacute;nico.",
    requiredConfirmMail: "Debes volver a ingresar tu correo electr&oacute;nico.",
    requiredRadio: "Debes seleccionar una opci&oacute;n para continuar.",
    requiredCode: "Debes ingresar el c&oacute;digo de restablecimiento para continuar.",
    remote: "Please fix this field.",
    email: "Debes ingresar un correo electr&oacute;nico v&aacute;lido. Ej.: cliente@ahorrador.com",
//    password2 : "Debe contener al menos una may&uacute;scula, letras y n&uacute;meros, no debe tener 3 n&uacute;meros consecutivos, m&iacute;nimo 8 caracteres",
    password2 : "La contraseña debe ser m&iacutenimo de 8 caracteres. Debe contener al menos una may&uacutescula, min&uacutesculas, al menos un n&uacutemero, no debe tener 3 n&uacutemeros consecutivos (123).",
    password3 : "La contraseña debe ser m&iacutenimo de 8 caracteres. Debe contener al menos una may&uacutescula, min&uacutesculas, al menos un n&uacutemero, no debe tener 3 n&uacutemeros consecutivos (123).",
	superpassword : "La contrase&ntilde;a debe ser de 8 a 16 caracteres. Por lo menos cuatro de ellos deben ser letras (may&uacute;sculas y min&uacute;sculas). Incluye al menos dos n&uacute;meros y por lo menos 1 car&aacute;cter especial (@,#,_,-,/,\\,*,$,!,?,=,+,%,&amp;,(,),:,;,,,.).",
    user_prestamos : "El usuario actual de Pr&eacutestamos es igual a tu n&uacutemero de cliente. Debe ser de 9 o 10 caracteres num&eacutericos.",
    password_prestamos : "La contraseña debe ser m&iacutenimo de 8 caracteres y m&aacuteximo de 10. Debe contener al menos una may&uacutescula, una min&uacutescula, un n&uacutemero y un car&aacutecter especial.",
    user_fondos : "El usuario actual de Fondos de Inversi&oacuten es igual a tu n&uacutemero de contrato. Debe ser de 6 caracteres num&eacutericos.",
    password_fondos : "La contraseña debe ser m&iacutenimo de 8 caracteres y m&aacuteximo de 10.",
    user_afore : "El usuario actual de AFORE debe ser de m&aacuteximo 10 caracteres. Puede tener letras, n&uacutemeros y caracteres especiales.",
    pass_afore : "Debe estar compuesta por 4 letras y 6 n&uacutemeros. Ej. PROF345162",
    claveOperacion : "Debe estar compuesta solamente por n&uacute;meros y letras. No debe de tener 3 n&uacute;meros consecutivos (123) y debe incluir al menos una may&uacute;scula y un n&uacute;mero. Deberá tener como m&iacute;nimo 8 caracteres y no deber&aacute de ser igual a tu contraseña.",
    tel2digits: "Debes ingresar los 10 d&iacute;gitos de tu n&uacute;mero celular. Ej.: 5512345678",
    tel10digits: "Debes ingresar los 10 d&iacute;gitos de tu n&uacute;mero telef&oacute;nico. Ej.: 5512345678",
    tel3digits: "Debes ingresar los 10 d&iacute;gitos de tu n&uacute;mero celular. Ej.: 5512345678",
    cuenta: "La estructura del n&uacute;mero de cuenta es incorrecta.",
    curpNss: "La estructura del CURP/NSS es incorrecta.",
    curp: "La CURP no es v&aacute;lida, favor de verificarla.",
    nss: "El NSS debe contener 11 d&iacutegitos.",
    contrato: "El Número de contrato debe contener 6 dígitos.",
    rfc: "El RFC no es v&aacute;lido, favor de verificarlo.",
    nip: "La estructura del NIP es incorrecta.",
    url: "Please enter a valid URL.",
    date: "Please enter a valid date.",
    dateISO: "Please enter a valid date (ISO).",
    dateinvISO: 'Debes ingresar una fecha (dd/mm/aaaa)',
    number: "El c&oacute;digo que ingresaste no es correcto. Por favor intenta de nuevo.",
    digits: "Por favor ingrese solo n&uacute;meros.",
    clabe: "Debes ingresar los 18 d&iacute;gitos de la CLABE. Ej.: 123456789123456789.",
    monto: 'El monto de la transferencia tiene un m&iacutenimo de $1.00 (un peso). Por favor int&eacutentalo de nuevo.',
    tarjeta: "Debes ingresar los 16 d&iacute;gitos de la tarjeta de d&eacute;bito. Ej.: 1234567812345678.",
    creditcard: "Please enter a valid credit card number.",
    equalTo: "Please enter the same value again.",
    equalToMail: "Los correos que ingresaste no coinciden.",
    equalToPassword: "Los campos no coinciden.",
    equalToClave: "Los campos de clave de operaci&oacuten no coinciden.",
    equalToNewPassword: "Los campos de nueva contrase&ntilde;a no coinciden.",
    NotequalTo: "Este campo no debe de ser igual al anterior.",
    NotequalToPass: "La nueva contrase&#241a no puede ser igual a la actual.",
    accept: "Please enter a value with a valid extension.",
    asesor: 'Debes ingresar la clave que te dio tu asesor, es de 24 a 30 d&iacute;gitos.',
    asesor2: 'Debes ingresar la clave que te dio tu asesor, es de 10 d&iacute;gitos.',
    nomensaje: '',
    maxlength: jQuery.validator.format("No debes introducir mas de {0} d&iacute;gitos."),
    minlength: jQuery.validator.format("Debes introducir al menos {0} d&iacute;gitos."),
    rangelength: jQuery.validator.format("Please enter a value between {0} and {1} characters long."),
    range: jQuery.validator.format("Please enter a value between {0} and {1}."),
    max: jQuery.validator.format("Debes ingresar un valor menor o igual a {0}."),
    min: jQuery.validator.format("Please enter a value greater than or equal to {0}."),
    nombre:'El nombre ingresado no es v&aacute;lido, favor emplea &uacute;nicamente letras, sin caracteres especiales.',
    paterno:'El apellido ingresado no es v&aacute;lido, por favor emplea &uacute;nicamente letras, sin caracteres especiales.',
    materno:'El apellido ingresado no es v&aacute;lido, por favor emplea &uacute;nicamente letras, sin caracteres especiales.',
    claveRastreo:'La clave de rastreo no es válida, favor de verificarla.',
    numeroCuenta:'El n&uacutemero de cuenta debe constar de 10 caracteres num&eacutericos.',
    numeroContrato:'El dato debe estar compuesto por 6 caracteres num&eacutericos.',
    numeroCliente:'Dato n&uacutemerico que consta de 9 caracteres.',
	clabe_tarjeta: 'Debes ingresar de 16 a 18 d&iacute;gitos Ej.: 1234567812345678.',
	differentToPassword: "La contrase&ntilde;a actual y la contrase&ntilde;a nueva deben ser diferentes.",
	equalToRFC:"La CURP no coincide con las diez primeras posiciones del RFC"
};
jQuery.validator.addMethod('equalToRFC', function(value, element) {
    var target = $('#rfc');
       if (this.settings.onfocusout) {
		   target.unbind(".validate-equalToRFC").bind("blur.validate-equalToRFC", function() {
			  $(element).valid();
		   });
		}
       target=target.val()+"";
    return value.substring(0,10).toUpperCase() === target.substring(0,10).toUpperCase();
});
jQuery.validator.addMethod('curpNss', function(value, element){
    return this.optional(element) || /^[a-zA-Z]{4}\d{6}[a-zA-Z]{6}\d{2}$/.test(value) ||   /^\d{11}$/.test(value);
});

jQuery.validator.addMethod('curp', function(value, element) {
    return this.optional(element) || Validation.curp(value);
});

jQuery.validator.addMethod('nss', function(value, element) {
    return this.optional(element) || /^\d{11}$/.test(value);
});

jQuery.validator.addMethod('contrato', function(value, element) {
    return this.optional(element) || /^\d{6}$/.test(value);
});

jQuery.validator.addMethod('tel10digits', function(value, element) {
    return this.optional(element) || /^\d{10}$/.test(value);
});

jQuery.validator.addMethod('numeroCuenta', function(value, element) {
    return this.optional(element) || /^\d{10}$/.test(value);
});

jQuery.validator.addMethod('numeroContrato', function(value, element) {
    return this.optional(element) || /^\d{6}$/.test(value);
});
jQuery.validator.addMethod('user_fondos', function(value, element) {
    return this.optional(element) || /^\d{6}$/.test(value);
});

jQuery.validator.addMethod('numeroCliente', function(value, element) {
    return this.optional(element) || /^\d{9}$/.test(value);
});

jQuery.validator.addMethod('rfc', function(value, element) {
    return this.optional(element) || Validation.rfc(value);
});

jQuery.validator.addMethod("alpha", function(value, element) {
    return this.optional(element) || /^[a-z ]+$/i.test(value);
}, "Solo letras por favor");

jQuery.validator.addMethod("nombre", function(value, element) {
    return this.optional(element) || /^[a-z _'\x2F\x5C@^;\u00a5%$&*\u00a1!\u00d1#\u00bf?.-]+$/i.test(value);
});
 
jQuery.validator.addMethod("paterno", function(value, element) {
    return this.optional(element) || /^[a-z _'\x2F\x5C@^;\u00a5%$&*\u00a1!\u00d1#\u00bf?.-]+$/i.test(value);
});
 
jQuery.validator.addMethod("materno", function(value, element) {
    return this.optional(element) || /^[a-z _'\x2F\x5C@^;\u00a5%$&*\u00a1!\u00d1#\u00bf?.-]+$/i.test(value);
});

jQuery.validator.addMethod('recaptcha', function(value, element) {
    //return $(this).post
});

jQuery.validator.addMethod("monto", function(value, element) {    
    return this.optional(element) || /^[1-9]+[0-9]{0,4}[.]\d{2}$/.test(value);
});

jQuery.validator.addMethod('claveRAstreo', function(value, element) {
    return this.optional(element) || /^-?(?:\d+|\d{5,30}(?:,\d{3})+)?%?$/.test(value);
});

jQuery.validator.addMethod('clabe', function(value, element) {
     return this.optional(element) || /^\d{16,18}$/.test(value);
});

jQuery.validator.addMethod('equalToPassword', function(value, element, param) {
    // bind to the blur event of the target in order to revalidate whenever the target field is updated
    // TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
    var target = $(param);
    if (this.settings.onfocusout) {
        target.unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
            $(element).valid();
        });
    }
    return value === target.val();
});

jQuery.validator.addMethod('equalToClave', function(value, element, param) {
    // bind to the blur event of the target in order to revalidate whenever the target field is updated
    // TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
    var target = $(param);
    if (this.settings.onfocusout) {
        target.unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
            $(element).valid();
        });
    }
    return value === target.val();
});

jQuery.validator.addMethod('NotequalTo', function(value, element, param) {
    var anterior = $(param).val();
    if (value == anterior) {
        return false;
    }
    return value;
});
jQuery.validator.addMethod('NotequalToPass', function(value, element, param) {
    var anterior = $(param).val();
    if (value == anterior) {
        return false;
    }
    return value;
});

jQuery.validator.addMethod('dateinvISO', function(value, element) {
    return this.optional(element) || /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(value);
});

jQuery.validator.addMethod('passwordfolio', function(value, element) {
    return /^.*(?=.{8,})(?=.*[A-Z])(?!.*\d{3,}.*).*$/.test(value);
});

jQuery.validator.addMethod('password2', function(value, element) {
    return this.optional(element) || Validation.password(value);
});

jQuery.validator.addMethod('password3', function(value, element) {
    return this.optional(element) || Validation.password(value);
});
jQuery.validator.addMethod('superpassword', function(value, element) {
    return this.optional(element) || Validation.superpassword(value);
});

jQuery.validator.addMethod('user_afore', function(value, element) {
    return this.optional(element) || Validation.user_afore(value);
});

jQuery.validator.addMethod('pass_afore', function(value, element) {
    return this.optional(element) || Validation.pass_afore(value);
});

jQuery.validator.addMethod('user_prestamos', function(value, element) {
    return this.optional(element) || /^\d{9,10}$/.test(value);
});

jQuery.validator.addMethod('password_prestamos', function(value, element) {
    return this.optional(element) || Validation.password_prestamos(value);
});

jQuery.validator.addMethod('password_fondos', function(value, element) {
    return this.optional(element) || Validation.password_fondos(value);
});

jQuery.validator.addMethod('claveOperacion', function(value, element) {
    return this.optional(element) || Validation.password(value);
});

jQuery.validator.addMethod('asesor', function(value, element) {
    return this.optional(element) || /^\w{24,30}$/i.test(value);
});

jQuery.validator.addMethod('asesor2', function(value, element) {
    return this.optional(element) || /^\w{10}$/i.test(value);
});
jQuery.validator.addMethod('clabe_tarjeta', function(value, element) {
    return this.optional(element) || /^\d{16,18}$/.test(value);
});
jQuery.validator.addMethod('differentToPassword', function(value, element) {
    var target = $('#formAjaxContrasena\\:oldpass');
    if (this.settings.onfocusout) {
        target.unbind(".validate-differentTo").bind("blur.validate-differentTo", function() {
            $(element).valid();
        });
    }
    return value !== target.val();
});

var Validation = {
    // Returns true if <s> is a valid RFC.
    // False otherwise.
    'rfc': function(s) {
        /*
         Verificar que el RFC se registre por lo menos a 10 posiciones y con un máximo de 13 caracteres. La composición de este dato debe seguir las siguientes reglas:
         - 4 caracteres alfabéticos
         - 2 caracteres numéricos
         - 2 caracteres numéricos (del 01 al 12)
         - 2 caracteres numéricos (del 01 al 31)
         - 3 últimos caracteres alfanuméricos
         */

        s = s.toUpperCase();

        var matched = s.match(/^[A-Z]{4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])([A-Z0-9]{3})?$/);

        if (matched == null) {
            return false;
        };

        return true;
    },
    // Returns true if <s> is a valid CURP.
    // False otherwise.
    'curp': function(s) {
        /*

         Validar que la CURP en la doble captura se registre a 18 posiciones conforme a las siguientes reglas de composición:
         - 4 caracteres alfabéticos
         - 2 caracteres numéricos
         - 2 caracteres numéricos (del 01 al 12)
         - 2 caracteres numéricos (del 01 al 31)
         - 1 carácter alfabético con valor “H” o “M”
         MISSING: - 2 caracteres alfabéticos con los valores correspondientes a la siguiente tabla de claves de estado:
         - 3 caracteres alfabéticos
         - 2 caracteres numéricos
         */
        var s = s.toUpperCase();

        var matched = s.match(/^[A-Z]{4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[A-Z]{3}[0-9A-Z]{2}$/);

        if (matched == null) {
            return false;
        };

        return true;
    },
    // Returns true if <s> is a valid monto.
    // False otherwise.
    'monto': function(s) {
        /*
         Validar que sea mayo a cero
         */
        if (s == 0) {
            return false;
        };

        return true;
    },
    // Returns true if <s> is a valid password.
    // False otherwise.
    'user_afore': function(s) {
        if (s.length != 10) {
            return false;
        };

        if (s.match(/[A-Z]/) == null) {
            return false;
        };

        if (s.match(/[a-z]/) == null) {
            return false;
        };

        if (s.match(/[0-9]/) == null) {
            return false;
        };

        if (s.match(/[.\$\@\*\!\-\=\?\_]/) == null) {
            return false;
        };

        return true;
    },
    // Returns true if <s> is a valid password.
    // False otherwise.
    'pass_afore': function(s) {
        if (s.length != 10) {
            return false;
        };

        if (s.match(/([a-zA-Z]{4})+([0-9]{6})/) == null) {
            return false;
        };
        return true;
    },
    'password_prestamos': function(s) {
        if (s.length < 9) {
            return false;
        };

        if (s.match(/[A-Z]/) == null) {
            return false;
        };

        if (s.match(/[a-z]/) == null) {
            return false;
        };

        if (s.match(/[0-9]/) == null) {
            return false;
        };

        if (s.match(/[.\$\@\*\!\-\=\?\_]/) == null) {
            return false;
        };

        return true;
    },
    'password_fondos': function(s) {
        if (s.length < 8 || s.length > 10) {
            return false;
        };

     

        return true;
    },
    'password': function(s) {
        /*
         Validación 3:
         Mínimo 8 caracteres
         Debe contener al menos una mayúscula
         letras y números
         NO debe tener 3 números consecutivos (por ejemplo 123 o 345)
         SI puede tener 3 números seguidos (por ejemplo 476 o 129).
         El campo de contraseña debe aceptar caracteres especiales. (Pendiente)
         */
        if (s.length < 8) {
            return false;
        };

        if (s.match(/[A-Z]/) == null) {
            return false;
        };

        if (s.match(/[a-z]/) == null) {
            return false;
        };

        if (s.match(/[0-9]/) == null) {
            return false;
        };


//    var contrasena = /[^a-zA-Z0-9!@\$\*=\._\?\-]/;
//    if ( !s.match( contrasena ) ) {
//      return false;
//    };

        if (s.match(/[^a-zA-Z0-9!@\$\*=\._\?\-]/) != null) {
            return false;
        };

//    if (s.match(/[^a-zA-Z0-9`~!@#\$%\^&\*\(\)_\-\+=\{\}\[\]\|:;"'<>,\.\?/]/) != null) {
//      return false;
//    };

        // Matching integer sequences.
        var seqs =  s.match(/[0-9]+/g);

        for (var i = 0; i < seqs.length; i++) {
            var seq = seqs[i];
            var pivot = new Number(seq[0]);
            // Incremental sequence.
            if (pivot < 7) {
                var fail = pivot + "" + (pivot + 1) + "" + (pivot + 2);
                if (seq.indexOf(fail) >= 0) {
                    return false;
                };
            };
            // Decremental sequence.
            if (pivot > 1) {
                var fail = pivot + "" + (pivot - 1) + "" + (pivot - 2);
                if (seq.indexOf(fail) >= 0) {
                    return false;
                };
            };
        };

        return true;
    },
    'superpassword': function(s) {
        if (s.length < 8) {
            return false;
        };

        if (s.match(/[A-Z]/) == null) {
            return false;
        };

        if (s.match(/[a-z]/) == null) {
            return false;
        };

        if (s.match(/[0-9]/) == null) {
            return false;
        };
        if (s.match(/([a-zA-Z].*?){4}/) == null) {
            return false;
        };
        if (s.match(/([0-9].*?){2}/) == null) {
            return false;
        };
		if (s.match(/([\@#_\-\\\*\$\!\?=+\%\&\(\):;\,\.].*?){1}/) == null) {
			return false;
        };
		for (var n = 0; n < s.length; n++) {
			var c = s.charCodeAt(n);
			if (!(c >= 48 && c <= 57) && !(c >= 65 && c <= 90) && !(c >= 97 && c <= 122) &&
				!(c >= 35 && c <= 38) && !(c >= 40 && c <= 47) && 
				!(c==33 || c==58 || c==59 || c==61 || c==63 || c==64 || c==92 || c==95)){
				return false;
			}
		}
        return true;
    }
}