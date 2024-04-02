const formInformation = {
    "1aa90452-a352-4bce-848b-645ce088b9f7": {
        step: 1,  // 1 Requirements
        progressBarPercentage: 0,
        timeRemaining: "60"
    },
    "1847fccb-4e07-46fd-b987-5abd688303d2": {
        step: 1,  // 1.1 Requirements
        progressBarPercentage: 18,
        timeRemaining: "45"
    },
    "b1ded006-4c7d-4192-ba18-a08eeda6081c": {
        step: 2, // 2 Your Info
        progressBarPercentage: 73,
        timeRemaining: "15"
    },
    "d6ed34de-f6d8-4408-8f8f-0472d4ceee59": {
        step: 3, // 3 Get advice
        progressBarPercentage: 91,
        timeRemaining: "5"
    }
};

const portalId = '45145570';
const target = '#multistep-form';
const solutionField = '0-2/solution';
const employeeField = '0-2/employees';

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
            addCustomCss(form);

            if (index === 3) {
                var firstname = dataMap.get(firstnameField);

                form.find('.hs-richtext.hs-main-font-element h1').html(function (index, oldHtml) {
                    return oldHtml.replace('{FirstName}', firstname);
                });

                form.find('.hs_' + solutionField).hide();
                form.find('input[name="' + employeeField + '"]').val(dataMap.get(employeeField)).change();
                form.find('input[name="' + firstnameField + '"]').val(dataMap.get(firstnameField)).change();
                form.find('input[name="' + lastnameField + '"]').val(dataMap.get(lastnameField)).change();
                form.find('input[name="' + emailField + '"]').val(dataMap.get(emailField)).change();
                form.find('input[name="' + companyField + '"]').val(dataMap.get(companyField)).change();

                solutionValues.forEach(value => {
                    form.find('input[name="' + solutionField + '"][value="' + value + '"]').prop('checked', true);
                });
            }
        },
        onFormSubmit: function(form) {
            if (index === 0 || index === 2) {
                serializeMap(form);
            } else if (index === 1) {
                const form2 = $(form).serializeArray();
                solutionValues = form2
                    .filter(item => item.name === solutionField)
                    .map(item => item.value);
            } else if (index === 3) {
                const hubspotSuccessMessage = document.getElementById('multistep-form');
                hubspotSuccessMessage.style.display = 'none';
            }
        },
        onFormSubmitted: function(form) {
            if (index < formKeys.length - 1) {
                const nextForm = formKeys[index + 1];
                const nextFormStep = formInformation[nextForm].step;

                if (nextFormStep === 2) {
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

const addCustomCss = (form) => {
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

    form.find('label[class="hs-form-radio"]')
        .css('padding-bottom', '6px');
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

multiStepForm();
