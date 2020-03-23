const GOOGLE_FONTS_KEY = 'AIzaSyA16KF8_GNmuMLgXw3MEwxLGndJ2qpF8QA';

const dropdownCategory = document.querySelector('.dropdown-category');
const buttonApply = document.querySelector('.btn-apply');
const dropdownTests = document.querySelector('.dropdown-tests');
const allTestsGroup = Array.from(document.querySelector('.tests').children);
const searchInput = document.querySelector('.search-input');
const dropdownFonts = document.querySelector('.dropdown-fonts');
const dropdownProperty = document.querySelector('.dropdown-property');

buttonApply.addEventListener('click', setFilter);
dropdownTests.addEventListener('change', selectTestGroup);
searchInput.addEventListener('change', setFontsDropdownHTML);
searchInput.addEventListener('keyup', setFontsDropdownHTML);
dropdownFonts.addEventListener('change', setProperties);
dropdownProperty.addEventListener('change', setStyle);

const allGoogleFonts = [];
let filteredGoogleFonts = [];
let currentFont = {};
fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_KEY}`)
    .then(response => response.json())
    .then(data => allGoogleFonts.push(...data.items))
    .then(() => {
        setCategoryDropdownHTML();
        setTestDropdownHTML();
    })
    .catch(err => console.error(err));

/**
 * 
 * @param {String} searchedFont 
 * @param {Array} filteredFonts
 * @returns {Array} of all fonts filtered by dropdown-category and search-input
 */
function findMatches(searchedFont, filteredFonts) {
    return filteredFonts.filter(font => {
        const regex = new RegExp(searchedFont, 'gi');
        return font.family.match(regex);
    });
}

/**
 * Show search controllers and apply the dropdown-category value
 */
function setFilter() {
    document.getElementsByClassName('search')[0].classList.remove('hidden');
    if (dropdownCategory.value === '') {
        filteredGoogleFonts = [...allGoogleFonts];
    } else {
        filteredGoogleFonts = allGoogleFonts.filter(font => dropdownCategory.value === font.category);
    }
    searchInput.value = '';
    setFontsDropdownHTML();
}

/**
 * 
 * @param {*} event on change event, use dropdown-tests value to show the correct test group
 */
function selectTestGroup(event) {
    allTestsGroup.forEach(testGroup => {
        testGroup.hidden = true;
    })
    const showTestGroup = allTestsGroup.find(testGroup => testGroup.classList.value === event.target.value);
    showTestGroup.hidden = false;
}

/**
 * set currentFont variable and fill dropdown-property with options
 */
function setProperties(event) {
    searchInput.value = event.target.value;
    currentFont = filteredGoogleFonts.filter(font => event.target.value === font.family)[0];
    setPropertyDropdownHTML();
}

/**
 * 
 * @param {*} event on change event, use dropdown-property value to set css font-family
 */
function setStyle(event) {
    const category = dropdownCategory.value === '' ? currentFont.category : dropdownCategory.value;
    const [fontFamily, fontUrl] = event.target.value.split(',');
    document.documentElement.style.setProperty('--myFontCategory', `${category}`);
    document.documentElement.style.setProperty('--myFontFamily', `${fontFamily}`);
    document.documentElement.style.setProperty('--myFontUrl', `${fontUrl}`);
}

/**
 * Fills dropdown-category with options
 */
function setCategoryDropdownHTML() {
    const allCategories = [];
    Object.values(allGoogleFonts).map(font => {
        if (!allCategories.includes(font.category)) {
            allCategories.push(font.category);
        }
    });

    if (allCategories.length === 0) return;
    const html = allCategories
        .map(categories => {
            return `<option value="${categories}">${categories}</option>`;
        })
        .join('');
    const initial = '<option value="">all fonts</option>';
    dropdownCategory.innerHTML = initial + html;
}

/**
 * Fills dropdown-tests with options
 */
function setTestDropdownHTML() {
    let html = '';
    for (let index = 1; index <= 6; index++) {
        html += `<option value="test${index}">Test${index} with h${index} and p tags:</option>`;
    }
    dropdownTests.innerHTML = html;
}

/**
* Fills dropdown-fonts with options
*/
function setFontsDropdownHTML() {
    if (filteredGoogleFonts.length === 0) return;
    const matchArray = findMatches(searchInput.value, filteredGoogleFonts);
    const html = matchArray
        .map(font => {
            return `<option value="${font.family}">${font.family}</option>`;
        })
        .join('');
    const initial = '<option value="">--Please choose an font--</option>';
    dropdownFonts.innerHTML = initial + html;
}

/**
 * Fills dropdown-property options
 */
function setPropertyDropdownHTML() {
    if (searchInput.value === '') return;
    const onj = {};
    for (const variant of currentFont.variants) {
        onj[variant] = [currentFont.family, currentFont.files[variant]];
    }
    if (Object.keys(onj).length === 0) return;
    const html = Object.entries(onj)
        .map(([variant, files]) => {
            return `<option value="${files}">${variant}</option>`;
        })
        .join('');
    const initial = '<option value="">--Please choose an property--</option>';
    dropdownProperty.innerHTML = initial + html;
}
