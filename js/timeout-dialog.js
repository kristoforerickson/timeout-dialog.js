String.prototype.format = function () {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

const pluralize = (count, noun, suffix = 's') =>
    `${count} ${noun}${count !== 1 ? suffix : ''}`;

!function ($) {
    $.timeoutDialog = {
        settings: {
            timeout: 1800,
            countdown: 300,
            keep_alive_url: '',
            logout_redirect_url: '/'
        },
        alertSetTimeoutHandle: 0,
        setupDialogTimer: function (options) {
            if (options !== undefined) {
                $.extend(this.settings, options);
            }

            var self = this;

            if (self.alertSetTimeoutHandle !== 0) {
                clearTimeout(self.alertSetTimeoutHandle);
            }

            self.alertSetTimeoutHandle = window.setTimeout(function () {
                self.setupDialog();
            }, (this.settings.timeout - this.settings.countdown) * 1000);
        },
        setupDialog: function () {
            var self = this;
            self.destroyDialog();

            $('<div class="modal" id="timeout-modal">' +
                '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                        '<div class="modal-header">Session Timeout</div>' +
                        '<div class="modal-body">' +
                            '<p id="timeout-message">Due to inactivity, your session will timeout in <span id="timeout-countdown">' + this.settings.countdown + ' seconds</span>.</p>' +
                        '</div>' +
                        '<div class="modal-footer">' +
                            '<div class="button prime skinny" id="timeoutKeepAliveBtn">Extend My Session</div>' +
                            '<div class="button secondary skinny" id="timeoutLogoutBtn">Logout Now</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>')
            .appendTo('body')
            .modal({
                backdrop: 'static',
                keyboard: false
            });

            $(document).on('click', '#timeoutKeepAliveBtn', function () {
                self.keepAlive();
            });

            $(document).on('click', '#timeoutLogoutBtn', function () {
                self.signOut(true);
            });

            self.startCountdown();
        },
        destroyDialog: function () {
            if ($("#timeout-modal").length) {
                $("#timeout-modal").modal("hide");
                $('#timeout-modal').remove();
            }
        },
        startCountdown: function () {
            var self = this,
                counter = this.settings.countdown;

            this.countdown = window.setInterval(function () {
                counter -= 1;
                var counterMessage = '';
                if (counter >= 60) {
                    var minutes = counter / 60;
                    var seconds = counter % 60; 

                    counterMessage = `${minutes} ${pluralize('minute')} ${seconds} ${pluralize('second')}`;
                } else {
                    counterMessage = counter + ' seconds';
                }

                $("#timeout-countdown").html(counterMessage);

                if (counter <= 0) {
                    window.clearInterval(self.countdown);
                    self.signOut(true);
                }

            }, 1000);
        },
        keepAlive: function () {
            var self = this;
            this.destroyDialog();
            window.clearInterval(this.countdown);
            
            if (this.settings.keep_alive_url !== '') {
                $.get(this.settings.keep_alive_url, function (data) {
                    if (data === "OK") {
                        self.setupDialogTimer();
                    } else {
                        self.signOut(false);
                    }
                });
            }
        },
        signOut: function (is_forced) {
            var self = this;
            this.destroyDialog();

            self.redirectLogout(is_forced);
        },
        redirectLogout: function (is_forced) {
            var target = this.settings.logout_redirect_url + '?next=' + encodeURIComponent(window.location.pathname + window.location.search);
            if (!is_forced)
                target += '&timeout=t';
            window.location = target;
        }
    };
}(window.jQuery);
