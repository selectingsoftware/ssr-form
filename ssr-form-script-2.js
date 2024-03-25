const formInformation = {
    "1aa90452-a352-4bce-848b-645ce088b9f7": {
        step: 1,  // 1 Requirements
        progressBarPercentage: 0,
        timeRemaining: "60"
    },
    "1847fccb-4e07-46fd-b987-5abd688303d2": {
        step: 1,  // 1.1 Requirements
        progressBarPercentage: 25,
        timeRemaining: "45"
    },
    "b1ded006-4c7d-4192-ba18-a08eeda6081c": {
        step: 2, // 2 Your Info
        progressBarPercentage: 50,
        timeRemaining: "30"
    },
    "d6ed34de-f6d8-4408-8f8f-0472d4ceee59": {
        step: 3, // 3 Get advice
        progressBarPercentage: 75,
        timeRemaining: "15"
    }
};

const portalId = '45145570';
const target = '#multistep-form';
const solutionField = '0-2/solution';
const employeeField = '0-2/employees';

const data = [];
const options = [];
const solutionValues = [];
const formKeys = Object.keys(formInformation);

const updateProgressBar = (nextForm) => {
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

        const translateXValue = percentage > 0 ? -(100 - percentage) + '%' : 0;
        progressBarFilled.style.transform = `translateX(${translateXValue})`;
    } else {
        const percentage = 100
        progressBar.setAttribute('aria-valuenow', percentage);
        progressText.innerText = `Progress: ${percentage}%`;

        const translateXValue = percentage > 0 ? -(100 - percentage) + '%' : 0;
        progressBarFilled.style.transform = `translateX(${translateXValue})`;

        const timerContainer = document.getElementById('timer-container');
        timerContainer.style.display = 'none';
    }
};

const generateFormOptions = (form, index) => {
    return {
        portalId,
        formId: form,
        target,
        onFormReady: function(form) {
            console.log('onFormReady: ', $(form).serializeArray());
            addEvents(form, index);
            addCustomCss(form);

            if (index === 2) {
                form.find('.hs_' + solutionField).hide();
                form.find('input[name="' + employeeField + '"]').val(data[0].value).change();

                solutionValues.forEach(value => {
                    form.find('input[name="' + solutionField + '"][value="' + value + '"]').prop('checked', true);
                });
            }

            if (index === 3) {
                var userName = extractValueByName(data, 'firstname');

                form.find('.hs-richtext.hs-main-font-element h1').html(function (index, oldHtml) {
                    return oldHtml.replace('{FirstName}', userName);
                });
            }
        },
        onFormSubmit: function(form) {
            console.log('onFormSubmit: ', $(form).serializeArray());
            if (index === 0) {
                const form1 = $(form).serializeArray();
                data.push(form1[0]);
            }
            if (index === 1) {
                const form2 = $(form).serializeArray();
                solutionValues.push(...form2
                    .filter(item => item.name === solutionField)
                    .map(item => item.value));
            }
            if (index === 2) {
                const form3 = $(form).serializeArray();
                data.push(...form3);
            }
        },
        onFormSubmitted: function(form) {
            console.log('onFormSubmitted: ', $(form).serializeArray());

            if (index < formKeys.length - 1) {
                const nextForm = formKeys[index + 1];
                const nextFormStep = formInformation[nextForm].step;

                if (nextFormStep === 3) {
                    const loadingContainer = document.getElementById('loading-container');
                    loadingContainer.style.display = 'block';

                    setTimeout(() => {
                        loadingContainer.style.display = 'none';
                        createFormAndUpdateProgressBar(nextForm, index + 1);
                    }, 30000);
                } else {
                    createFormAndUpdateProgressBar(nextForm, index + 1);
                }
            } else {
                const submittedMessageDiv = form.find('div[class="submitted-message"]')
                const submittedMessageDiv2 = document.querySelector('.submitted-message')

                console.log('submittedMessageDiv: ', submittedMessageDiv);
                console.log('submittedMessageDiv2: ', submittedMessageDiv2);

                const meetingsDivElement = createDivElement('meetings-iframe-container', 'https://meetings.hubspot.com/zach-mason/zach-advisor-calls?embed=true');
                const meetingsScriptElement = createScriptElement('https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js');

                console.log('meetingsDivElement: ', meetingsDivElement);
                console.log('meetingsScriptElement: ', meetingsScriptElement);

                if (submittedMessageDiv) {     
                    submittedMessageDiv.append(meetingsDivElement);
                    submittedMessageDiv.append(meetingsScriptElement);
                }

                if (submittedMessageDiv2) {
                    submittedMessageDiv2.append(meetingsDivElement);
                    submittedMessageDiv2.append(meetingsScriptElement);
                }
                
                updateProgressBar();
            }
        }
    };
};

const createScriptElement = (src) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    return script;
};

const createDivElement = (className, dataSrc) => {
    const div = document.createElement('div');
    div.className = className;
    div.setAttribute('data-src', dataSrc);
    return div;
};

const createFormAndUpdateProgressBar = (form, index) => {
    hbspt.forms.create(options[index]);

    if (form) {
        updateProgressBar(form);
    }
};

const extractValueByName = (array, name) => {
    for (var i = 0; i < array.length; i++) {
        if (array[i].name === name) {
            return array[i].value;
        }
    }
    return null;
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
        .css('padding', '5px');

    form.find('div[class="actions"]')
        .css('display', 'flex')
        .css('flex-direction', 'row');

    form.find('button[class="hs-back-button"]')
        .css('color', 'rgb(0, 0, 0)')
        .css('background-colorn', 'rgb(237, 237, 237)')
        .css('min-width', '45px')
        .css('border-radius', '4px')
        .css('border', '0px')
        .css('padding', '6px 8px')
        .css('transition', 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;')
        .css('cursor', 'pointer');
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
            console.log('inputID: ', inputId);
    
            if (inputId) {
                var input = form.find('#' + inputId);
                console.log('input: ', input);
    
                if (input.length > 0) {
                    form.submit();
                }
            }
        });
    }

    if (index > 0) {
        //const backButton = $('<input type="button" class="hs-button primary large" value="Voltar">');
        const backButton = $('<div style="height: 100%;"><button class="hs-back-button" tabindex="0" type="button"><span><svg focusable="false" aria-hidden="true" viewBox="0 0 24 24"><path d="M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6z"></path></svg></span></button></div><div>&nbsp;</div>');
        backButton.on('click', function(event) {
            event.preventDefault();
            const previousForm = formKeys[index - 1];
            createFormAndUpdateProgressBar(previousForm, index - 1);
        });
        form.find('.actions').prepend(backButton);
    }

    form.find('button[class="hs-back-button"]').on('mouseover', function(event) {
        event.preventDefault();
    
        $(this).css('box-shadow', 'rgba(0, 0, 0, 0.4) 2px 4px 10px 1px');
    });

    form.find('button[class="hs-back-button"]').on('mouseout', function(event) {
        event.preventDefault();

        $(this).css('box-shadow', '');
    });
};

const multiStepForm = () => {
    formKeys.forEach((form, index) => {
        options.push(generateFormOptions(form, index));
    });

    hbspt.forms.create(options[0]);
};

multiStepForm();
