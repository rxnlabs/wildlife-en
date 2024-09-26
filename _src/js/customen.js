module.exports = function($) {

    var jQ = $;

    var customEn = {
        settings: {
            bodyClasses: {
                '/action'               : 'action',
                '/petition'             : 'petition',
                '/donate/'              : 'donate',
                '/subscriptions'        : 'subscriptions'
            },
        },
        urlParams: null,
        getURLParams: function () {

            function readURLParams() {
                var match,
                    pl     = /\+/g,  // Regex for replacing addition symbol with a space
                    search = /([^&=]+)=?([^&]*)/g,
                    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                    query  = window.location.search.substring(1);

                customEn.urlParams = {};
                while (match = search.exec(query))
                    customEn.urlParams[decode(match[1])] = decode(match[2]);
            }

            if ( typeof window.onpopstate !== 'undefined' ) {
                window.onpopstate = readURLParams();
            } else {
                window.onhashchange = readURLParams();
            }

            return customEn.urlParams;
        },
        /**
         * Adds a class to the body element based on the Salsa page type
         */
        addBodyClass : function( classes, append ) {
            var
                page = window.location.pathname,
                addedClass = null,
                $body = jQ('body');

            if ( append !== true ) {
                classes = typeof classes !== 'undefined' ? classes : customEn.settings.bodyClasses ;
            } else if ( append === true ) {
                if ( typeof Array.isArray === 'function' && Array.isArray(classes) ) {
                    var appendClasses = '';
                    var separator = ' ';
                    jQ.each( classes, function(index, value) {
                        if ( index == classes.length - 1 ) {
                            separator = '';
                        }
                        appendClasses += value + separator;
                    });

                    $body.addClass(appendClasses);

                } else if ( typeof classes === 'string' ) {
                    $body.addClass(classes);
                }
                // @todo: Add a test case to see if the "classes" argument is an object literal http://stackoverflow.com/questions/1173549/how-to-determine-if-an-object-is-an-object-literal-in-javascript

                classes = customEn.settings.bodyClasses;
            }

            // loop thru and add to body
            // stop once we've hit one, as a page shouldn't be multiple
            jQ.each( classes, function( test, className ){
                if ( page.indexOf(test) > 1 ) {
                    $body.addClass(className);
                    addedClass = className;
                    // if we're on a "shop" page, we can have multiple classes
                    if ( !page.indexOf('shop') > 1) {
                        return false;
                    }
                }
            });

            if ($( '.en__ecarditems__list' ).length) {
                $body.addClass('ecard');
            }

        }, // END addBodyClass()
        fieldPosition: function() {
            /* get the position of fields on the page and use their position to determine certain things about them */
            var $fields = $('.en__component--formblock > .en__field');

            $.map($fields, function(element,index){
               var $element = $(element);
               var $nextElement = $element.next();
               $element.addClass(index.toString());

               if ( $nextElement.length > 0 ) {
                   var $is_next_element_a_input = $nextElement.find('input,textarea,select,button');

                   if ( $is_next_element_a_input.length > 0 ) {
                       // get all of the classes for this element since jQuery doesn't support classList
                       var classList = $nextElement.attr('class').split(/\s+/);
                       /*
                       add the type of field that the next field is.

                       Engaging Networks has the field type as the third class listed for an element.
                        */
                       if ( classList[3] !== undefined ) {
                           $element.addClass('next-'+classList[3]);
                       }
                   }
               }
            });
        },
        petition: {

        },
        donation: {
        },
        shareSocial: function(facebook_app_data) {
            var is_logged_into_facebook = false;
            var facebook_opt_in_checkbox = document.querySelector('input[name="supporter.NOT_TAGGED_52"]');
            var current_form = '';

            if ( facebook_opt_in_checkbox ) {
                current_form = facebook_opt_in_checkbox.form;
            }

            var facebook_share_result_field = $('input[name="supporter.NOT_TAGGED_51"]');

            // determine if the Facebook JS API is loaded
            function isFacebookSDKLoaded() {
                if ( typeof FB == 'object' &&  FB.hasOwnProperty('getLoginStatus') ) {
                    return true;
                } else {
                    return false;
                }
            }

            function isFacebookLoggedIn() {
                FB.getLoginStatus(function(response) {

                    if (response.status === 'connected') {
                        is_logged_into_facebook = true;
                    }
                    else {
                        is_logged_into_facebook = false;
                    }

                    return is_logged_into_facebook;
                });
            }

            // add an event handler that detects if a facebook sharing checkbox is on the form
            function enableSocialShareCheckbox() {
                $(facebook_opt_in_checkbox).on('change', function(e){
                    var $this = $(this);
                    if ( $this.is(':checked') ) {
                        $(current_form).addClass('facebook-publish');
                    } else {
                        $(current_form).removeClass('facebook-publish');
                    }
                }).trigger('change');
            }

            // handle the heavy lifting adn publish the form to a user's facebook wall
            function publishFacebook(e) {
                var $this_form = $(e.target);
                var current_form_url = window.location.origin + window.location.pathname;
                // prvent the form from being submitted
                if ( !$this_form.hasClass('ready') && $this_form.hasClass('facebook-publish') && didUserPublishToWall() === false ) {
                    e.preventDefault();
                } else {
                    $this_form.unbind('submit', publishFacebook);
                    $this_form.off('submit', publishFacebook);
                    unbindFormSubmitAndSubmit($this_form);
                    return true;
                }

                if ( $this_form.hasClass('facebook-publish') ) {
                    // make sure all of the required fields are filled out before publishing to the user's wall
                    var required_fields = $this_form.find('.en__mandatory input, .en__mandatory select, .en__mandatory textarea, input[required], textarea[required], select[required]');

                    var missing_required_fields = new Array;

                    $.map(required_fields, function(node, index){
                        var $element = $(node);
                        var element_type = $element.prop("tagName").toLowerCase();

                        if ( element_type !== 'radio' && element_type !== 'checkbox' ) {
                            var value = $element.val();
                            if ( value.trim().length <= 0 && $element.hasClass) {
                                missing_required_fields.push($element);
                            }
                        } else {
                            var element_name = $element.prop('name');
                            var is_input_selected = $('input[name="' + element_name + '"]:checked');

                            if ( is_input_selected.length <= 0 ) {
                                missing_required_fields.push($element);
                            }
                        }
                    });

                    if ( missing_required_fields.length == 0 ) {
                        if ( didUserDenyFacebookAdminAccess() ) {
                            // if the user did not grant app access to post to their wall, then only present the user with a share dialog
                            FB.ui({
                                method: 'share',
                                href: current_form_url
                            }, function(response){
                                // the user shared the EN action on their wall
                                if ( response !== undefined && response.hasOwnProperty('post_id') ) {
                                    facebook_share_result_field.val('Did not granted app access and but shared action on Facebook');
                                } else {
                                    facebook_share_result_field.val('Did not grant app access and did not share on Facebook');
                                }
                                
                                unbindFormSubmitAndSubmit($this_form);
                            });
                        } else {
                            FB.login(function(response){
                                // the user authorized the App to post on their behalf
                                if ( response.authResponse ) {
                                    $this_form.addClass('ready');
                                    // Note: The call will only work if you accept the permission request
                                    FB.api('/me/feed', 'post', {
                                        name: document.title,
                                        link: current_form_url
                                    });
                                    facebook_share_result_field.val('Granted app access and posted to user\'s wall');
                                    setTimeout(function(){
                                        unbindFormSubmitAndSubmit($this_form);
                                    }, 2500);
                                } else {
                                    $this_form.addClass('ready');
                                    // if the user did not grant app access to post to their wall, let's remember that selection
                                    var get_label = $(facebook_opt_in_checkbox).prop('checked', false).attr('disabled','disabled').prop('id');
                                    var checkbox_label = $('label[for="'+get_label+'"]');
                                    checkbox_label.text(checkbox_label.text() + ' (access not authorized)');
                                    trackUserDenyFacebookAppAccess();
                                    setTimeout(function(){
                                        unbindFormSubmitAndSubmit($this_form);
                                    }, 500);
                                }

                            }, {
                                scope: 'publish_actions',
                                return_scopes: true
                            });
                        }
                        
                    }
                }
            }

            // unbind the submit event handler and submit the form again
            function unbindFormSubmitAndSubmit(form_to_unbind) {
                if ( form_to_unbind instanceof jQuery ) {
                    var $this_form = form_to_unbind;
                } else {
                    var $this_form = $(form_to_unbind);
                }
                
                $this_form.unbind('submit', publishFacebook);
                $this_form.off('submit', publishFacebook);
                trackPublishedToWall();
                $this_form.submit();
            }

            // add a session storage to determine if the user already submitted the form
            function trackPublishedToWall() {
                store.session.set('en-facebook-share' + getPageId(), 'true');
            }

            // delete the session storage in so the user can share on wall again
            function deletePublishToWallTracker() {
                store.session.remove('en-facebook-share' + getPageId())
            }

            // detect if the user already published this campaign to their wall during this current tab session
            function didUserPublishToWall() {
                if ( typeof store == 'undefined' ) {
                    return false;
                } else {
                    if ( store.session.has('en-facebook-share' + getPageId()) ) {
                        return true;
                    } else {
                        return false;
                    }
                }
                
            }

            // track if the user denied the facebook app access so we don't keep showing the user the popup that enables us to post on their behalf
            function trackUserDenyFacebookAppAccess() {
                if ( typeof facebook_app_data !== undefined && facebook_app_data.hasOwnProperty('appId') ) {
                    store.set('en-facebook-app-denied' + facebook_app_data.appId, 'true');
                    return true;    
                }
            }

            // use this as a flag to determine if the user should be shown the regular Facebook share dialog so they can manually share on their own wall
            function didUserDenyFacebookAdminAccess() {
                if ( typeof store !== 'undefined' && store.has('en-facebook-app-denied' + facebook_app_data.appId) ) {
                    return true;
                } else {
                    return false;
                }
            }

            // generate an identifier for a page based on the form id and page
            function getPageId() {
                
                if ( typeof pageJson == 'object' ) {
                    return pageJson.campaignPageId + '-' + pageJson.pageNumber;
                } else {
                    var page = window.location.href;
                    var matches = page.match(/page\/(.*)(?=\/)/);
                    
                    if ( matches !== null && matches.length > 0 ) {
                        var page_id_page_type = matches[1].split('/');
                        var form_type = '';
                        var page_id = '';
                        if ( page_id_page_type ) {
                            form_type = page_id_page_type[1];
                            page_id = page_id_page_type[0];

                            var regex_string = '/' + form_type + '\/(.*)(?=(#|\?))/';
                            var regex = new RegExp(regex_string);
                            var get_page_number = page.match(regex);
                            console.log(get_page_number);
                            if ( get_page_number !== null && get_page_number.length > 0 ) {
                                var page_type_page_number = get_page_number[1].split('/');

                                if ( page_type_page_number ) {
                                    var page_number = page_type_page_number[1];
                                }
                            }
                        }
                    }

                    
                }
            }

            if ( isFacebookSDKLoaded() ) {
                // load a localstorage library that we're using to determine if the user submitted the form correctly to prevent us from posting to their wall multiple times
                (function(d, s, id){
                   var js, fjs = d.getElementsByTagName(s)[0];
                   if (d.getElementById(id)) {return;}
                   js = d.createElement(s); js.id = id;
                   js.src = "https://cdnjs.cloudflare.com/ajax/libs/store2/2.5.9/store2.min.js";
                   fjs.parentNode.insertBefore(js, fjs);
                 }(document, 'script', 'store2'));

                if ( facebook_opt_in_checkbox ) {
                    // if the user already published this campaign to their wall during this tab session, then don't publish it to their wall again (this helps if the form had errors submitting like wrong input format, wrong credit card information, etc...)
                    if ( typeof store !== 'undefined' ) {
                        if ( !didUserPublishToWall() === false ) {
                            enableSocialShareCheckbox();
                            $(current_form).on('submit', publishFacebook);
                        }
                    } else {
                        enableSocialShareCheckbox();
                        $(current_form).on('submit', publishFacebook);
                    }
                } 
                
            } else {
                console.log('facebook sdk not loaded. Facebook SDK needed for social sharing');
            }
        }
    };

    return customEn;
}