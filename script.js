function predictPrice() {
    var formData = {
        make: document.getElementById('makeSelect').value,
        model: document.getElementById('modelSelect').value,
        variant: document.getElementById('variantSelect').value,
        year: document.getElementById('yearSelect').value,
        mileage: document.getElementById("mileage").value,
        "fuel type": document.getElementById('fuelTypeSelect').value,
        transmission: document.getElementById('transmissionSelect').value,
        "registered in": document.getElementById('registeredInSelect').value,
        color: document.getElementById('colorSelect').value,
        assembly: document.getElementById('assemblySelect').value,
        "engine capacity": document.getElementById('engineCapacitySelect').value,
    };

    console.log(formData);

    var requestBody = JSON.stringify(formData);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:5000/predict");
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var predictedPrice = Math.round(parseFloat(xhr.responseText));
            var formattedPrice = formatPrice(predictedPrice);
            document.getElementById('prediction').innerHTML = "Predicted Price: PKR " + formattedPrice;
            document.getElementById('predictionContainer').style.display = 'block';

            clearRecommendations();
            getRecommendations(predictedPrice);
        }
    };
    xhr.send(requestBody);
}

function getRecommendations(predictedPrice) {
    var registeredIn = document.getElementById('registeredInSelect').value;
    var year = parseFloat(document.getElementById('yearSelect').value) || 0;
    var engineCapacity = parseFloat(document.getElementById('engineCapacitySelect').value) || 0;

    var formData = {
        registered_in: registeredIn,
        year: year,
        'engine capacity': engineCapacity,
        predicted_price: predictedPrice
    };

    fetch('http://localhost:5000/recommendations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch recommendations');
            }
            return response.json();
        })
        .then(recommendations => {
            if (recommendations.error || recommendations.length === 0) {
                let element = document.getElementById('recommendation');
                element.style.display = "none";
                let element_2 = document.getElementById('error');
                element_2.innerText = "No Recommendations Found in your Price Range";
                element_2.style.display = "block";
                setTimeout(function () {
                    element_2.innerText = "";
                    element_2.style.display = "none";
                }, 3000);
            } else {
                displayRecommendations(recommendations);
                let element_2 = document.getElementById('error');
                element_2.style.display = "none";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            clearRecommendations();
            let element = document.getElementById('recommendation');
            element.style.display = "none";
            let element_2 = document.getElementById('error');
            element_2.innerText = "No Recommendations Found in your Price Range";
            element_2.style.display = "block";
            setTimeout(function () {
                element_2.innerText = "";
                element_2.style.display = "none";
            }, 3000);
        });
}

function clearRecommendations() {
    var recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = '';
    document.getElementById('recommendationsContainer').style.display = 'none';
}

function displayRecommendations(recommendations) {
    var recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = '';

    let element = document.getElementById('recommendation');
    element.style.display = "block";

    recommendations.forEach((car, carIndex) => {
        const firstImageUrl = car.Pictures.split(', ')[0];
        var formattedPrice = formatPrice(Math.round(car.Price));

        var carInfo = document.createElement('div');
        carInfo.className = 'recommendation-card';

        carInfo.innerHTML = `
            <div class="row">
                <div class="col-md-8">
                    <p><strong>Make:</strong> ${car.Make}</p>
                    <p><strong>Model:</strong> ${car.Model}</p>
                    <p><strong>Variant:</strong> ${car.Variant}</p>
                    <p><strong>Year:</strong> ${car.Year}</p>
                    <p><strong>Mileage:</strong> ${car.Mileage} KM</p>
                    <p><strong>Engine Capacity:</strong> ${car['Engine Capacity']} CC</p>
                    <p><strong>Price:</strong> PKR ${formattedPrice}</p>
                </div>
                <div class="col-md-4">
                    <img src="${firstImageUrl}" alt="Car Image" class="img-thumbnail custom-image-container" onclick="showImageModal('${car.Pictures}')">
                </div>
            </div>
        `;
        recommendationsList.appendChild(carInfo);
    });

    document.getElementById('recommendationsContainer').style.display = 'block';
}


function formatPrice(price) {
    return price.toLocaleString('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}


function showImageModal(picturesString) {
    const modalCarouselInner = document.getElementById('modalCarouselInner');
    modalCarouselInner.innerHTML = generateImageHTML(picturesString);

    // Create and append the close icon
    const closeIcon = document.createElement('span');
    closeIcon.innerHTML = '&times;';
    closeIcon.className = 'close-icon';
    closeIcon.addEventListener('click', function () {
        $('#carouselModal').modal('hide');
    });
    document.body.appendChild(closeIcon);

    // Create and append left navigation
    const leftNav = document.createElement('a');
    leftNav.className = 'carousel-control-prev';
    leftNav.href = '#modalCarousel';
    leftNav.setAttribute('role', 'button');
    leftNav.setAttribute('data-slide', 'prev');
    leftNav.innerHTML = '<span>&#10094;</span>';
    document.body.appendChild(leftNav);

    // Create and append right navigation
    const rightNav = document.createElement('a');
    rightNav.className = 'carousel-control-next';
    rightNav.href = '#modalCarousel';
    rightNav.setAttribute('role', 'button');
    rightNav.setAttribute('data-slide', 'next');
    rightNav.innerHTML = '<span>&#10095;</span>';
    document.body.appendChild(rightNav);

    $('#carouselModal').modal('show');

    // Remove white background
    $('.modal-content').removeClass('img-thumbnail');

    // Add the semi-transparent overlay
    $('body').append('<div class="carousel-overlay"></div>');

    // Remove the overlay and icons when the modal is hidden
    $('#carouselModal').on('hidden.bs.modal', function () {
        $('.carousel-overlay').remove();
        $('.close-icon').remove();
        $('.carousel-control-prev').remove();
        $('.carousel-control-next').remove();
        $('body').removeClass('modal-open');
    });

    // Keyboard navigation
    $(document).on('keydown', function (e) {
        if (e.key === 'ArrowLeft') {
            $('#modalCarousel').carousel('prev');
        } else if (e.key === 'ArrowRight') {
            $('#modalCarousel').carousel('next');
        }
    });

    // Remove keyboard event listener when the modal is hidden
    $('#carouselModal').on('hidden.bs.modal', function () {
        $(document).off('keydown');
    });
}





function generateImageHTML(picturesString) {
    const pictureUrls = picturesString.split(', ');
    const validPictureUrls = pictureUrls.slice(0, -1); // Exclude the last image
    const imagesHTML = validPictureUrls.map((url, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="${url}" class="d-block w-100" alt="Car Image">
        </div>
    `).join('');
    return imagesHTML;
}

// Function to load JSON file and populate dropdowns
function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'data.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == 200) {
            callback(JSON.parse(xobj.responseText));
        }
    };
    xobj.send(null);
}

// Function to populate unique "Make" values into options
function populateMakes(jsonData) {
    var makeSelect = document.getElementById('makeSelect');
    var makes = {};

    jsonData.forEach(function (car) {
        makes[car.Make] = true;
    });

    for (var make in makes) {
        var option = document.createElement('option');
        option.text = make;
        makeSelect.add(option);
    }

    makeSelect.addEventListener('change', function () {
        var selectedMake = makeSelect.value;
        if (selectedMake) {
            populateModels(selectedMake, jsonData);
        } else {
            clearModels();
            clearVariants();
            clearYears();
            clearFuelTypes();
            clearEngineCapacities();
            clearColors();
            clearTransmissions();
            clearAssemblies();
        }
    });
}

function populateModels(selectedMake, jsonData) {
    var modelSelect = document.getElementById('modelSelect');
    var models = {};

    jsonData.forEach(function (car) {
        if (car.Make === selectedMake) {
            models[car.Model] = true;
        }
    });

    clearModels();
    clearVariants();
    clearYears();
    clearFuelTypes();
    clearEngineCapacities();
    clearColors();
    clearTransmissions();
    clearAssemblies();

    for (var model in models) {
        var option = document.createElement('option');
        option.text = model;
        modelSelect.add(option);
    }

    modelSelect.addEventListener('change', function () {
        var selectedModel = modelSelect.value;
        if (selectedModel) {
            populateVariants(selectedMake, selectedModel, jsonData);
        } else {
            clearVariants();
            clearYears();
            clearFuelTypes();
            clearEngineCapacities();
            clearColors();
            clearTransmissions();
            clearAssemblies();
        }
    });
}

function populateVariants(selectedMake, selectedModel, jsonData) {
    var variantSelect = document.getElementById('variantSelect');
    var variants = {};

    jsonData.forEach(function (car) {
        if (car.Make === selectedMake && car.Model === selectedModel) {
            variants[car.Variant] = true;
        }
    });

    clearVariants();
    clearYears();
    clearFuelTypes();
    clearEngineCapacities();
    clearColors();
    clearTransmissions();
    clearAssemblies();

    for (var variant in variants) {
        var option = document.createElement('option');
        option.text = variant;
        variantSelect.add(option);
    }

    variantSelect.addEventListener('change', function () {
        var selectedVariant = variantSelect.value;
        if (selectedVariant) {
            populateYears(selectedMake, selectedModel, selectedVariant, jsonData);
        } else {
            clearYears();
            clearFuelTypes();
            clearEngineCapacities();
            clearColors();
            clearTransmissions();
            clearAssemblies();
        }
    });
}

function populateYears(selectedMake, selectedModel, selectedVariant, jsonData) {
    var yearSelect = document.getElementById('yearSelect');
    var years = {};

    jsonData.forEach(function (car) {
        if (car.Make === selectedMake && car.Model === selectedModel && car.Variant === selectedVariant) {
            years[car.Year] = true;
        }
    });

    clearYears();
    clearFuelTypes();
    clearEngineCapacities();
    clearColors();
    clearTransmissions();
    clearAssemblies();

    for (var year in years) {
        var option = document.createElement('option');
        option.text = year;
        yearSelect.add(option);
    }

    yearSelect.addEventListener('change', function () {
        var selectedYear = yearSelect.value;
        if (selectedYear) {
            populateFuelTypes(selectedMake, selectedModel, selectedVariant, selectedYear, jsonData);
            populateTransmissions(selectedMake, selectedModel, selectedVariant, selectedYear, jsonData);
            populateAssemblies(selectedMake, selectedModel, selectedVariant, selectedYear, jsonData);
        } else {
            clearFuelTypes();
            clearEngineCapacities();
            clearColors();
            clearTransmissions();
            clearAssemblies();
        }
    });
}

function populateTransmissions(selectedMake, selectedModel, selectedVariant, selectedYear, jsonData) {
    var transmissionSelect = document.getElementById('transmissionSelect');
    var transmissions = {};

    jsonData.forEach(function (car) {
        if (car.Make === selectedMake && car.Model === selectedModel && car.Variant === selectedVariant && car.Year === selectedYear) {
            transmissions[car.Transmission] = true;
        }
    });

    clearTransmissions();

    for (var transmission in transmissions) {
        var option = document.createElement('option');
        option.text = transmission;
        transmissionSelect.add(option);
    }
}

function populateAssemblies(selectedMake, selectedModel, selectedVariant, selectedYear, jsonData) {
    var assemblySelect = document.getElementById('assemblySelect');
    var assemblies = {};

    jsonData.forEach(function (car) {
        if (car.Make === selectedMake && car.Model === selectedModel && car.Variant === selectedVariant && car.Year === selectedYear) {
            assemblies[car.Assembly] = true;
        }
    });

    clearAssemblies();

    for (var assembly in assemblies) {
        var option = document.createElement('option');
        option.text = assembly;
        assemblySelect.add(option);
    }
}

// ENT TrANSMISSION hERE

function populateFuelTypes(selectedMake, selectedModel, selectedVariant, selectedYear, jsonData) {
    var fuelTypeSelect = document.getElementById('fuelTypeSelect');
    var fuelTypes = {};

    jsonData.forEach(function (car) {
        if (car.Make === selectedMake && car.Model === selectedModel && car.Variant === selectedVariant && car.Year === selectedYear) {
            fuelTypes[car['Fuel Type']] = true;
        }
    });

    clearFuelTypes();
    clearEngineCapacities();
    clearColors();

    for (var fuelType in fuelTypes) {
        var option = document.createElement('option');
        option.text = fuelType;
        fuelTypeSelect.add(option);
    }

    fuelTypeSelect.addEventListener('change', function () {
        var selectedFuelType = fuelTypeSelect.value;
        if (selectedFuelType) {
            populateEngineCapacities(selectedMake, selectedModel, selectedVariant, selectedYear, selectedFuelType, jsonData);
        } else {
            clearEngineCapacities();
            clearColors();
        }
    });
}

function populateEngineCapacities(selectedMake, selectedModel, selectedVariant, selectedYear, selectedFuelType, jsonData) {
    var engineCapacitySelect = document.getElementById('engineCapacitySelect');
    var engineCapacities = {};

    jsonData.forEach(function (car) {
        if (car.Make === selectedMake && car.Model === selectedModel && car.Variant === selectedVariant && car.Year === selectedYear && car['Fuel Type'] === selectedFuelType) {
            engineCapacities[car['Engine Capacity']] = true;
        }
    });

    clearEngineCapacities();
    clearColors();

    for (var engineCapacity in engineCapacities) {
        var option = document.createElement('option');
        option.text = engineCapacity;
        engineCapacitySelect.add(option);
    }

    engineCapacitySelect.addEventListener('change', function () {
        var selectedEngineCapacity = engineCapacitySelect.value;
        if (selectedEngineCapacity) {
            populateColors(selectedMake, selectedModel, selectedVariant, selectedYear, selectedFuelType, selectedEngineCapacity, jsonData);
        } else {
            clearColors();
        }
    });
}

function populateColors(selectedMake, selectedModel, selectedVariant, selectedYear, selectedFuelType, selectedEngineCapacity, jsonData) {
    var colorSelect = document.getElementById('colorSelect');
    var colors = {};

    jsonData.forEach(function (car) {
        if (car.Make === selectedMake && car.Model === selectedModel && car.Variant === selectedVariant && car.Year === selectedYear && car['Fuel Type'] === selectedFuelType && car['Engine Capacity'] === selectedEngineCapacity) {
            colors[car.Color] = true;
        }
    });

    clearColors();

    for (var color in colors) {
        var option = document.createElement('option');
        option.text = color;
        colorSelect.add(option);
    }

    // Add 'other' option
    var otherOption = document.createElement('option');
    otherOption.text = 'Other';
    colorSelect.add(otherOption);

    colorSelect.addEventListener('change', function () {
        var selectedColor = colorSelect.value;
        if (selectedColor === 'Other') {
            showColorInput();
        } else {
            hideColorInput();
        }
    });


    // Hide color input field when any of the dependent select fields change
    var dependentSelects = ['makeSelect', 'modelSelect', 'variantSelect', 'yearSelect', 'fuelTypeSelect', 'engineCapacitySelect'];
    dependentSelects.forEach(function (selectId) {
        document.getElementById(selectId).addEventListener('change', function () {
            hideColorInput();
        });
    });
}

function showColorInput() {
    var colorInputDiv = document.getElementById('colorInputDiv');
    colorInputDiv.style.display = 'block';
}

function hideColorInput() {
    var colorInputDiv = document.getElementById('colorInputDiv');
    colorInputDiv.style.display = 'none';
}

function clearModels() {
    var modelSelect = document.getElementById('modelSelect');
    modelSelect.innerHTML = '<option value="">Select Model</option>';
}

function clearVariants() {
    var variantSelect = document.getElementById('variantSelect');
    variantSelect.innerHTML = '<option value="">Select Variant</option>';
}

function clearYears() {
    var yearSelect = document.getElementById('yearSelect');
    yearSelect.innerHTML = '<option value="">Select Year</option>';
}

function clearFuelTypes() {
    var fuelTypeSelect = document.getElementById('fuelTypeSelect');
    fuelTypeSelect.innerHTML = '<option value="">Select Fuel Type</option>';
}

function clearEngineCapacities() {
    var engineCapacitySelect = document.getElementById('engineCapacitySelect');
    engineCapacitySelect.innerHTML = '<option value="">Select Engine Capacity</option>';
}

function clearColors() {
    var colorSelect = document.getElementById('colorSelect');
    colorSelect.innerHTML = '<option value="">Select Color</option>';
}

function clearTransmissions() {
    var transmissionSelect = document.getElementById('transmissionSelect');
    transmissionSelect.innerHTML = '<option value="">Select Transmission</option>';
}

function clearAssemblies() {
    var assemblySelect = document.getElementById('assemblySelect');
    assemblySelect.innerHTML = '<option value="">Select Assembly</option>';
}

// Initialize the dropdown population process for Registered In
loadJSON(populateRegisteredIn);

function populateRegisteredIn(jsonData) {
    var registeredInSelect = document.getElementById('registeredInSelect');
    var registeredInValues = {};

    // Loop through JSON data to find unique 'Registered In' values
    jsonData.forEach(function (car) {
        registeredInValues[car['Registered In']] = true;
    });

    // Clear existing options
    clearRegisteredIn();

    // Add 'Un-Registered' option at the top
    var unregisteredOption = document.createElement('option');
    unregisteredOption.text = 'Un-Registered';
    registeredInSelect.add(unregisteredOption);

    // Populate dropdown with unique 'Registered In' values
    for (var registeredIn in registeredInValues) {
        if (registeredIn !== 'Un-Registered') {
            var option = document.createElement('option');
            option.text = registeredIn;
            registeredInSelect.add(option);
        }
    }
}

function clearRegisteredIn() {
    var registeredInSelect = document.getElementById('registeredInSelect');
    registeredInSelect.innerHTML = '<option value="">Select Registered In</option>';
}

// Add event listener for form submission
document.getElementById('carForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission
    // Collect selected options
    var formData = {
        Make: document.getElementById('makeSelect').value,
        Model: document.getElementById('modelSelect').value,
        Variant: document.getElementById('variantSelect').value,
        Year: document.getElementById('yearSelect').value,
        Mileage: document.getElementById("mileage").value,
        "Fuel Type": document.getElementById('fuelTypeSelect').value,
        Transmission: document.getElementById('transmissionSelect').value,
        "Registered In": document.getElementById('registeredInSelect').value,
        Color: document.getElementById('colorSelect').value,
        Assembly: document.getElementById('assemblySelect').value,
        "Engine Capacity": document.getElementById('engineCapacitySelect').value,
    };

    // Saving form data to a JSON file
    // saveDataToJson(formData);

    // Reload the page
});

function saveDataToJson(formData) {
    var jsonData = JSON.stringify(formData); // Convert form data to JSON string
    var blob = new Blob([jsonData], { type: "application/json" }); // Create a Blob object
    var url = URL.createObjectURL(blob); // Create a URL for the Blob object

    // Create a temporary anchor element
    var a = document.createElement('a');
    a.href = url;
    a.download = 'submit.json'; // Set the file name
    document.body.appendChild(a); // Append the anchor element to the body
    a.click(); // Simulate a click event to trigger the download
    document.body.removeChild(a); // Remove the anchor element
    URL.revokeObjectURL(url); // Revoke the object URL to free up memory
}

// Disable registeredIn, transmission, assembly, mileage, and submit button initially
document.getElementById('registeredInSelect').disabled = true;
document.getElementById('transmissionSelect').disabled = true;
document.getElementById('assemblySelect').disabled = true;
document.getElementById('mileage').disabled = true;
document.addEventListener('DOMContentLoaded', function () {
    // Disable submit button initially
    document.getElementById('submitButton').disabled = true;

    // Other DOM manipulation code goes here...
});

// Add event listener for color input
document.getElementById('colorSelect').addEventListener('input', function () {
    // Enable the registeredInSelect
    document.getElementById('registeredInSelect').disabled = false;
});

// Add event listener for registeredIn input
document.getElementById('registeredInSelect').addEventListener('input', function () {
    // Enable the transmissionSelect
    document.getElementById('transmissionSelect').disabled = false;
});

// Add event listener for transmission input
document.getElementById('transmissionSelect').addEventListener('input', function () {
    // Enable the assemblySelect
    document.getElementById('assemblySelect').disabled = false;
});

// Add event listener for assembly input
document.getElementById('assemblySelect').addEventListener('input', function () {
    // Enable the mileage input
    document.getElementById('mileage').disabled = false;
});

document.addEventListener('DOMContentLoaded', function () {
    // Add event listener for mileage input
    var mileageInput = document.getElementById('mileage');
    if (mileageInput) {
        mileageInput.addEventListener('input', function () {
            // Enable the submit button
            document.getElementById('submitButton').disabled = false;
        });
    } else {
        console.error("Element with ID 'mileage' not found.");
    }
});

// Initialize the dropdown population process
loadJSON(populateMakes);
