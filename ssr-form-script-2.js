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

const updateStepBar = (currentStep, nextForm) => {
    const stepElements = document.querySelectorAll('.step');
    stepElements.forEach((stepElement, index) => {
        if (index + 1 === currentStep) {
            stepElement.classList.add('active');
        }
    });

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
    }
};

const addCompletedClass = (step) => {
    const stepElements = document.querySelectorAll('.step');
    stepElements.forEach((stepElement, index) => {
        if (index + 1 === step) {
            stepElement.classList.add('completed');
        }
    });
};

const generateFormOptions = (form, index) => {
    return {
        portalId,
        formId: form,
        target,
        onFormReady: function(form) {
            addEvents(form);

            if (index === 2) {
                form.find('.hs_' + solutionField).hide();
                form.find('input[name="' + employeeField + '"]').val(data[0].value).change();

                solutionValues.forEach(value => {
                    form.find('input[name="' + solutionField + '"][value="' + value + '"]').prop('checked', true);
                });
            }

            if (index === 3) {
                console.log('data: ', data);
                var userName = extractValueByName(data, 'firstname');
                console.log('username: ', userName);

                var richtextElements = document.getElementsByClassName('hs-richtext');

                for (var i = 0; i < richtextElements.length; i++) {
                    if (richtextElements[i].innerHTML.includes('{FirstName}')) {
                        richtextElements[i].innerHTML = richtextElements[i].innerHTML.replace('{FirstName}', userName);
                    }
                }
            }
        },
        onFormSubmit: function(form) {
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
                console.log(form3);
                data = data.concat(form3);
            }
        },
        onFormSubmitted: function() {
            if (index < formKeys.length - 1) {
                hbspt.forms.create(options[index + 1]);
                
                const nextForm = formKeys[index + 1];
                const nextStep = formInformation[nextForm].step;
                if (nextStep) {
                    updateStepBar(nextStep, nextForm);
                }
            }
            addCompletedClass(index);
        }
    };
};

const extractValueByName = (array, name) => {
    for (var i = 0; i < array.length; i++) {
        if (array[i].name === name) {
            return array[i].value;
        }
    }
    return null;
};

const addEvents = (form) => {
    form.find('input[type="submit"]').on('mouseover', function(event) {
        event.preventDefault();
    
        $(this).css('box-shadow', 'rgba(0, 0, 0, 0.4) 2px 4px 10px 1px');
    });

    form.find('input[type="submit"]').on('mouseout', function(event) {
        event.preventDefault();

        $(this).css('box-shadow', '');
    });
};

const multiStepForm = () => {
    formKeys.forEach((form, index) => {
        options.push(generateFormOptions(form, index));
    });

    updateStepBar(1);

    hbspt.forms.create(options[0]);
};

multiStepForm();
