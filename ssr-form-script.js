const formToStepMapping = {
    "1aa90452-a352-4bce-848b-645ce088b9f7": 1, // 1 Requirements
    "1847fccb-4e07-46fd-b987-5abd688303d2": 1, // 1.1 Requirements
    "b1ded006-4c7d-4192-ba18-a08eeda6081c": 2, // 2 Your Info
    "d6ed34de-f6d8-4408-8f8f-0472d4ceee59": 3  // 3 Get advice
};

const portalId = '45145570';
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
        } else {
            stepElement.classList.remove('active');
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
                $(target).empty();
                window.hbspt.forms.create(options[index + 1]);
                
                const nextForm = formKeys[index + 1];
                const nextStep = formToStepMapping[nextForm];
                if (nextStep) {
                    updateStepBar(nextStep);
                    addCompletedClass(index);
                }
            }
        }
    };
};

const multiStepForm = () => {
    formKeys.forEach((form, index) => {
        options.push(generateFormOptions(form, index));
    });

    updateStepBar(1);

    window.hbspt.forms.create(options[0]);
};

multiStepForm();
