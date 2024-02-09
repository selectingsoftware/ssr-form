const formToStepMapping = {
    "69dba9c6-a008-435d-866e-3d8f23ce936d": 1, // 1 Requirements
    "77cdf42b-3eec-4bc8-8219-0310a41d5924": 1, // 1.1 Requirements
    "0bdcee61-bc3f-4450-b5d4-5453268fde89": 2, // 2 Your Info
    "347762a3-e6f8-4c4a-b4a2-e11b560fd6e3": 3  // 3 Get advice
};

const portalId = '22035903';
const target = '#multistep-form';

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
                form.find('input[name="0-2/employees"]').val(data[0].value).change();

                const checkboxes = document.querySelectorAll('input[name="0-2/solution"]');
                solutionValues.forEach(value => {
                    Array.from(checkboxes).forEach(cb => {
                        if (cb.value === value) {
                            cb.checked = true;
                        }
                    });
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
                solutionValues.length = 0; // Clear previous values
                solutionValues.push(...incoming
                    .filter(item => item.name === "0-2/solution")
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
