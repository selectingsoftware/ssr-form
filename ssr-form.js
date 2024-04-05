const formInformation = {
    "69dba9c6-a008-435d-866e-3d8f23ce936d": {
        step: 1,  // How many employees are in your company?
        progressBarPercentage: 0,
        timeRemaining: "60"
    },
    "77cdf42b-3eec-4bc8-8219-0310a41d5924": {
        step: 2,  // What kind of solutions are you looking for?
        progressBarPercentage: 25,
        timeRemaining: "45"
    },
    "ab08f443-4da2-4cd6-bb81-9bab35772677": {
        step: 3,  // Where should we send your HR software advice?
        progressBarPercentage: 70,
        timeRemaining: "20"
    },
    "0bdcee61-bc3f-4450-b5d4-5453268fde89": {
        step: 4, // How should we get in touch?
        progressBarPercentage: 80,
        timeRemaining: "10"
    },
    "347762a3-e6f8-4c4a-b4a2-e11b560fd6e3": {
        step: 5, // Can we get your Phone Number?
        progressBarPercentage: 95,
        timeRemaining: "5"
    }
};

const portalId = '22035903';
const target = '#multistep-form';
const solutionField = 'software_type_requested';
const employeeField = 'annualrevenue';
const firstnameField = 'firstname';
const lastnameField = 'lastname';
const emailField = 'email';
const companyField = 'company';

const dataMap = new Map();
const options = [];
let solutionValues = [];
const formKeys = Object.keys(formInformation);

let error_messages = {
    firstname: 'Please provide your first name',
    lastname: 'Please provide your last name',
    email: 'Please provide your business email',
    company: 'Please provide your company name',
    tel: 'Please provide your phone number'
}

const updateProgressBar = (nextForm, loader) => {
    const progressBar = document.getElementById('progress-bar');
    const progressBarFilled = document.getElementById('progress-bar-filled');
    const progressText = document.getElementById('progress-text');
    const timerText = document.getElementById('timer-text-replaced');

    if (nextForm) {
        const percentage = formInformation[nextForm].progressBarPercentage;
        const timeRemaining = formInformation[nextForm].timeRemaining;
    
        progressBar.setAttribute('aria-valuenow', percentage);
        progressText.innerText = `Progress: ${percentage}%`;
        timerText.innerText = timeRemaining;

        const translateXValue = percentage > 0 ? -(100 - percentage) + '%' : '-100%';
        progressBarFilled.style.transform = `translateX(${translateXValue})`;
    } else if (loader) {
        const percentage = 50
        const timeRemaining = '30';

        progressBar.setAttribute('aria-valuenow', percentage);
        progressText.innerText = `Progress: ${percentage}%`;
        timerText.innerText = timeRemaining;

        const translateXValue = percentage > 0 ? -(100 - percentage) + '%' : '-100%';
        progressBarFilled.style.transform = `translateX(${translateXValue})`;
    } else {
        const percentage = 100
        progressBar.setAttribute('aria-valuenow', percentage);
        progressText.innerText = `Progress: ${percentage}%`;

        const translateXValue = percentage > 0 ? -(100 - percentage) + '%' : '-100%';
        progressBarFilled.style.transform = `translateX(${translateXValue})`;

        const timerContainer = document.getElementById('timer-container');
        timerContainer.style.display = 'none';

        const hubspotCalender = document.getElementById('hubspotCalender');
        hubspotCalender.style.display = 'block';
    }
};

const generateFormOptions = (form, index) => {
    return {
        portalId,
        formId: form,
        target,
        locale: 'en',
        translations: {
            en: {
                missingOptionSelection: "Please select at least one option.",
            }
        },
        onFormReady: function(form) {
            addCustomValidate(form);
            addEvents(form, index);
            addCustomCss(form, index);

            setValueAndChange(form, employeeField, dataMap);
            setValueAndChange(form, firstnameField, dataMap);
            setValueAndChange(form, lastnameField, dataMap);
            setValueAndChange(form, emailField, dataMap);
            setValueAndChange(form, companyField, dataMap);

            if (index === 1 || index === 4) {
                solutionValues.forEach(value => {
                    form.find('input[name="' + solutionField + '"][value="' + value + '"]').prop('checked', true).change();
                });
            }

            if (index === 4) {
                form.find('.hs_' + solutionField).hide();
                const firstname = dataMap.get(firstnameField);

                form.find('.hs-richtext.hs-main-font-element h1').html(function (index, oldHtml) {
                    return oldHtml.replace('{FirstName}', firstname);
                });
            }
        },
        onFormSubmit: function(form) {
            if (index === 4) {
                const hubspotSuccessMessage = document.getElementById('multistep-form');
                hubspotSuccessMessage.style.display = 'none';
            } else if (index === 1) {
                const form2 = $(form).serializeArray();
                solutionValues = form2
                    .filter(item => item.name === solutionField)
                    .map(item => item.value);
            } else {
                serializeMap(form);
            }
        },
        onFormSubmitted: function(form) {
            if (index < formKeys.length - 1) {
                const nextForm = formKeys[index + 1];
                const nextFormStep = formInformation[nextForm].step;

                if (nextFormStep === 3) {
                    const loadingContainer = document.getElementById('loading-container');
                    loadingContainer.style.display = 'block';

                    updateProgressBar(undefined, true);

                    setTimeout(() => {
                        loadingContainer.style.display = 'none';
                        createFormAndUpdateProgressBar(nextForm, index + 1);
                    }, 3000);
                } else {
                    createFormAndUpdateProgressBar(nextForm, index + 1);
                }
            } else {
                updateProgressBar();
            }            
        }
    };
};

const createFormAndUpdateProgressBar = (form, index) => {
    hbspt.forms.create(options[index]);

    if (form) {
        updateProgressBar(form);
    }
};

const serializeMap = (form) => {
    const formData = $(form).serializeArray();
    formData.forEach((field, i) => {
        dataMap.set(field.name, field.value);
    });
};

const setValueAndChange = (form, fieldName, dataMap) => {
    const field = form.find('input[name="' + fieldName + '"]');
    const value = dataMap.get(fieldName);
    if (field.length > 0 && value) {
        field.val(value).change();
    }
}

const addCustomCss = (form, index) => {
    form.find('label[class="hs-form-radio-display"]')
        .css('color', 'rgba(0, 0, 0, 0.87)')
        .css('transition', 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms')
        .css('background-color', 'rgb(249, 249, 249)')
        .css('border', '1px solid rgb(198, 198, 198)')
        .css('border-radius', '4px')
        .css('box-shadow', 'rgba(33, 33, 33, 0.1) 0px 2px 5px')
        .css('box-sizing', 'border-box')
        .css('cursor', 'pointer')
        .css('position', 'relative')
        .css('overflow', 'visible')
        .css('padding', '5px')
        .css('display', 'flex')
        .css('align-items', 'center');

    form.find('div[class="actions"]')
        .css('display', 'flex')
        .css('flex-direction', 'row')
        .css('padding', '0px');

    form.find('button[class="hs-back-button"]')
        .css('color', 'rgb(0, 0, 0)')
        .css('background-colorn', 'rgb(237, 237, 237)')
        .css('min-width', '52px')
        .css('border-radius', '4px')
        .css('border', '0px')
        .css('padding', '6px 8px')
        .css('transition', 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;')
        .css('cursor', 'pointer');

    form.find('label[class="hs-form-checkbox-display"]')
        .css('display', 'flex')
        .css('align-items', 'center');
    
    form.find('input.hs-input[type="checkbox"], input.hs-input[type="radio"]')
        .css('width', '20px')
        .css('height', '20px');

    form.find('li[class="hs-form-radio"]')
        .css('padding-bottom', '6px');

    if (index < 2) {
        form.find('div.hs-form-field > label > span')
            .css('font-size', '24px');
    }
}

const addEvents = (form, index) => {
    form.find('input[type="submit"]').on('mouseover', function(event) {
        event.preventDefault();
    
        $(this).css('box-shadow', 'rgba(0, 0, 0, 0.4) 2px 4px 10px 1px');
    });

    form.find('input[type="submit"]').on('mouseout', function(event) {
        event.preventDefault();

        $(this).css('box-shadow', '');
    });

    if (index === 0) {
        var labels = form.find('label');
        labels.on('click', function() {
            var inputId = $(this).attr('for');
            if (inputId) {
                var input = form.find('#' + inputId);
                if (input.length > 0) {
                    serializeMap(form);
                    form.submit();
                }
            }
        });
    }

    if (index > 0) {
        const backButton = $('<div style="height: 100%;"><button class="hs-back-button" tabindex="0" type="button"><span><svg focusable="false" aria-hidden="true" viewBox="0 0 24 24"><path d="M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6z"></path></svg></span></button></div><div>&nbsp;</div>');
        backButton.on('click', function(event) {
            event.preventDefault();
            const previousForm = formKeys[index - 1];
            createFormAndUpdateProgressBar(previousForm, index - 1);
        });
        form.find('.actions').prepend(backButton);
    }
};

const addCustomValidate = (form) => {
    let input = form.find('input[type="text"], input[type="tel"], input[type="email"]');
    let inputCheckbox = form.find('.input ul');

    function globalInputsOnChangeHandler() {
        for (var i = 0; i < input.length; i += 1) {
            let typeCheck = input[i].getAttribute('type') == 'checkbox' || input[i].getAttribute('type') == 'tel' ? true : input[i].hasAttribute('required')
            if (error_messages.hasOwnProperty(input[i].getAttribute('name')) || typeCheck ) {
                let changedElement = input[i];
                setTimeout(function() {
                    if (changedElement.classList.contains('invalid') || changedElement.classList.contains('error')) {
                        let parentElement = changedElement.closest('.field');
                        let errorDiv = parentElement.querySelector('.hs-error-msg');
                        if (errorDiv && changedElement.getAttribute('type') == 'tel') {
                            errorDiv.innerHTML = `<span>&#9888;</span> ${error_messages['tel']}`
                        } else if (errorDiv) {
                            errorDiv.innerHTML = `<span>&#9888;</span> ${error_messages[changedElement.getAttribute('name')]}`
                        }
                    }
                }, 50)
            }
        }
        let complete_all_fields = form.find('.hs_error_rollup');
        if (complete_all_fields.length > 0) {
            complete_all_fields[0].style.display = 'none';
        }
    }

    var observer = new MutationObserver(function(e) {
        globalInputsOnChangeHandler()
    });

    for (var i = 0; i < input.length; i += 1) {
        let typeCheck = input[i].getAttribute('type') == 'checkbox' || input[i].getAttribute('type') == 'tel' ? true : input[i].hasAttribute('required')
        if (error_messages.hasOwnProperty(input[i].getAttribute('name')) || typeCheck) {
            attributeName = input[i].getAttribute('name')
            if (attributeName) {
                var target = form.find(`input[name=${attributeName}]`);       
                if (target) {   
                    observer.observe(target[0], {
                        attributes: true
                    });
                }
            } else {
                var targetTel = form.find('input[type="tel"]');
                if (targetTel) {
                    observer.observe(targetTel[0], {
                        attributes: true
                    });
                }
            }    
        }
    }

    if (inputCheckbox.length > 0) {
        observer.observe(inputCheckbox[0], {
            attributes: true
        });
    }
}

const multiStepForm = () => {
    formKeys.forEach((form, index) => {
        options.push(generateFormOptions(form, index));
    });

    hbspt.forms.create(options[0]);
};

const injectHtmlIntoBody = () => {
    const divId = 'ssr-advisor-survey';
    const divForm = document.getElementById(divId);
    if (!divForm) {
        console.error("Div with ID %s not found.", divId);
        return;
    }

    var noscriptElement = document.createElement('noscript');
    noscriptElement.innerHTML = `
        <!-- Google Tag Manager (noscript) -->
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NL23BB7"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        <!-- End Google Tag Manager (noscript) -->

        <!--[if lte IE 8]>
        <script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/v2-legacy.js"></script>
        <![endif]-->
        <script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/v2.js"></script>

        <script type="text/javascript" src="https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js"></script>
    `;
    document.body.insertBefore(noscriptElement, document.body.firstChild);

    const htmlContent = `
        <div class="ssr-form-container">
            <div id="progress-bar-container">
                <div class="progress-bar-root">
                    <p id="progress-text">Progress: 0%</p>
                    <span id="progress-bar" class="color-primary progress-bar" aria-valuenow="0" aria-valuemin="0"
                        aria-valuemax="100">
                        <span id="progress-bar-filled" class="bar-color-primary progress-bar-filled"
                            style="transform: translateX(-100%);"></span>
                    </span>
                </div>
            </div>
            <div id="multistep-form"></div>
            <div id="loading-container" style="display: none;">
                <iframe class="loader" src="https://lottie.host/embed/fa227226-0e57-4675-93a1-c84bd08bd327/vaCcpWJtKB.json"></iframe>
                <p class="loading-text">Hold on - we're finding vendors that best match your needs!</p>
            </div>
            <div id="hubspotCalender" style="display: none;">
                <p style="text-align: center;">Thank you! Our Software Advisor will reach out to you shortly. You can also book a 1:1 meeting with our Software Advisor:</p>            </p>
                <div class="meetings-iframe-container" data-src="https://meetings.hubspot.com/zach-mason/zach-advisor-calls?embed=true"></div>
            </div>
            <div id="timer-container">
                <p id="timer-text">
                    <svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path
                            d="M176 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h16V98.4C92.3 113.8 16 200 16 304c0 114.9 93.1 208 208 208s208-93.1 208-208c0-41.8-12.3-80.7-33.5-113.2l24.1-24.1c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L355.7 143c-28.1-23-62.2-38.8-99.7-44.6V64h16c17.7 0 32-14.3 32-32s-14.3-32-32-32H224 176zm72 192V320c0 13.3-10.7 24-24 24s-24-10.7-24-24V192c0-13.3 10.7-24 24-24s24 10.7 24 24z">
                        </path>
                    </svg>
                    <strong id="timer-text-replaced">60</strong> seconds left...
                </p>
            </div>
        </div>
    `;

    divForm.innerHTML = htmlContent;
};

const injectHtmlIntoHeader = () => {
    var scriptElement = document.createElement('script');
    scriptElement.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js";

    var linkElement = document.createElement('link');
    linkElement.href = 'https://fonts.googleapis.com/css?family=Lato:400,700';
    linkElement.rel = 'stylesheet';
    linkElement.type = 'text/css';

    var googleAnalytics1 = document.createElement('script');
    googleAnalytics1.async = true;
    googleAnalytics1.src = 'https://www.googletagmanager.com/gtag/js?id=G-41DMX9N3MF';

    var googleAnalytics2 = document.createElement('script');
    googleAnalytics2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-41DMX9N3MF');
    `;

    var googleTagManager = document.createElement('script');
    googleTagManager.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-NL23BB7');
    `;

    var styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.innerHTML = `
        #multistep-form form {
            -webkit-animation: fadein 1s;
            -moz-animation: fadein 1s;
            -ms-animation: fadein 1s;
            -o-animation: fadein 1s;
            animation: fadein 1s;
        }

        @keyframes fadein {
            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }

        /* Firefox < 16 */
        @-moz-keyframes fadein {
            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }

        /* Safari, Chrome and Opera > 12.1 */
        @-webkit-keyframes fadein {
            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }

        /* Internet Explorer */
        @-ms-keyframes fadein {
            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }

        /* Opera < 12.1 */
        @-o-keyframes fadein {
            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }

        @media (min-width: 500px) {
            .svg-icon {
                font-size: 13px;
            }
        }

        .svg-icon {
            user-select: none;
            width: 1em;
            height: 1em;
            display: inline-block;
            fill: currentcolor;
            flex-shrink: 0;
            transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
            font-size: 12px;
            color: rgb(0, 0, 0);
            margin-right: 0.3rem;
            position: relative;
            top: 2px;
        }

        .ssr-form-container {
            width: 100%;
            padding: 20px 35px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        #progress-bar-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }

        .progress-bar-filled.bar-color-primary {
            background-color: rgb(57, 218, 150);
        }

        .progress-bar-filled {
            width: 100%;
            position: absolute;
            left: 0px;
            bottom: 0px;
            top: 0px;
            transition: transform 0.4s linear 0s;
            transform-origin: left center;
            background-color: rgb(94, 194, 230);
        }

        .progress-bar.color-primary {
            background-color: rgb(247, 247, 247);
        }

        .progress-bar-root {
            height: 25px;
            display: grid;
            width: 100%;
        }

        .progress-bar {
            overflow: hidden;
            display: block;
            z-index: 0;
            background-color: rgb(193, 231, 245);
            height: 100%;
            position: relative;
            grid-row-start: 1;
            grid-column-start: 1;
        }

        #progress-text {
            margin: 0px;
            font-family: "Public Sans", sans-serif;
            font-weight: bold;
            grid-row-start: 1;
            grid-column-start: 1;
            position: relative;
            width: inherit;
            z-index: 1;
            line-height: 25px;
            font-size: 11px;
            text-shadow: rgb(255, 255, 255) 1px 1px 4px;
            color: rgb(0, 0, 0);
            text-align: center;
            transition: color 0.5s ease 0s, textShadow 0.5s ease 0s;
        }

        #timer-container {
            display: flex;
            justify-content: center;
            height: 100%;
        }

        #timer-text {
            margin: 0px;
            font-family: "Public Sans", sans-serif;
            font-weight: 400;
            line-height: 1.5;
            font-size: 12px;
            color: rgb(0, 0, 0);
        }

        #loading-container {
            text-align: center;
        }

        .loader {
            overflow: hidden;
            transition: height 500ms ease 0s;
            min-width: 300px;
            border-radius: inherit;
            border-style: none;
            height: 300px;
            max-width: 710px 
        }

        .loading-text {
            margin: 0px 0px 25px 0px;
            font-family: Lato, sans-serif;
            font-size: 1.3rem;
            line-height: 1.5;
            color: rgb(0, 0, 0);
            font-weight: 700;
            text-align: center;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    document.head.appendChild(scriptElement);
    document.head.appendChild(linkElement);
    document.head.appendChild(styleElement);
    document.head.appendChild(googleTagManager);
    document.head.appendChild(googleAnalytics1);
    document.head.appendChild(googleAnalytics2);
};

window.onload = function() {
    injectHtmlIntoHeader();
    injectHtmlIntoBody();
    multiStepForm();
};