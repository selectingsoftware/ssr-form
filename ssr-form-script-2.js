const formToStepMapping = {
    "1aa90452-a352-4bce-848b-645ce088b9f7": 1, // 1 Requirements
    "1847fccb-4e07-46fd-b987-5abd688303d2": 1, // 1.1 Requirements
    "b1ded006-4c7d-4192-ba18-a08eeda6081c": 2, // 2 Your Info
    "d6ed34de-f6d8-4408-8f8f-0472d4ceee59": 3  // 3 Get advice
};

const portalId = '45145570';
const target = '#multistep-form';
const solutionField = '0-2/solution';
const employeeField = "0-2/employee_number"

const data = [];
const options = [];
const solutionValues = [];
const formKeys = Object.keys(formToStepMapping);

const updateStepBar = (currentStep) => {
    const stepElements = document.querySelectorAll('.step');
    stepElements.forEach((stepElement, index) => {
        if (index + 1 === currentStep) {
            stepElement.classList.add('active');
        }
    });
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
            if (index === 2) {
                form.find('.hs_' + solutionField).hide();
                form.find('input[name="' + employeeField + '"]').val(data[0].value).change();

                solutionValues.forEach(value => {
                    form.find('input[name="' + solutionField + '"][value="' + value + '"]').prop('checked', true);
                });
            }
        },
        onFormSubmit: function(form) {
            if (index === 0) {
                const incoming = $(form).serializeArray();
                data.push(incoming[0]);
            }
            if (index === 1) {
                const incoming = $(form).serializeArray();
                solutionValues.push(...incoming
                    .filter(item => item.name === solutionField)
                    .map(item => item.value));
            }
        },
        onFormSubmitted: function() {
            if (index < formKeys.length - 1) {
                hbspt.forms.create(options[index + 1]);
                
                const nextForm = formKeys[index + 1];
                const nextStep = formToStepMapping[nextForm];
                if (nextStep) {
                    updateStepBar(nextStep);
                }
            }
            addCompletedClass(index);
        }
    };
};

const multiStepForm = () => {
    formKeys.forEach((form, index) => {
        options.push(generateFormOptions(form, index));
    });

    updateStepBar(1);

    hbspt.forms.create(options[0]);
};

multiStepForm();
