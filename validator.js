
// `Validator constructor`
function Validator (options) {
  var formElement = document.querySelector(options.form)
  var selectorRules = {}

  function getParentElement(element, selector) {
    while (element.parentElement){
      if(element.parentElement.matches(selector)){
        return element.parentElement;
      }
      element = element.parentElement
    }
  }

  function Validate (inputElement, rule) {
    var ErrorMessage;
    var ErrorElement = getParentElement(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
    var rules = selectorRules[rule.selector]

    // lặp qua và check từng rule
    for(let i = 0; i<rules.length; i++) {
      ErrorMessage = rules[i](inputElement.value)
      
      if(ErrorMessage) break;
    }

    if(ErrorMessage){
      ErrorElement.innerHTML = ErrorMessage
      getParentElement(inputElement,options.formGroupSelector).classList.add('invalid')
      
    } else {
      ErrorElement.innerHTML = ''
      getParentElement(inputElement,options.formGroupSelector).classList.remove('invalid')

    }
    return !!ErrorMessage;
  }
  
  // xử lí sự kiện submit form
  formElement.onsubmit = (e) => {
    e.preventDefault()

    var isFormValid = true;

    // tiến hành validate toàn bộ form
    options.rules.forEach(rule => {
      var inputElement = formElement.querySelector(rule.selector)
      var isValid = Validate(inputElement, rule)

      if(isValid) {
        isFormValid = false
      }
      
    })

    if(isFormValid) {
      // Trường hợp submit form với JS
      if(typeof options.onSubmit === 'function'){
        var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')

        // chuyển từ kiểu NodeList sang Array
        var formValues = Array.from(enableInputs).reduce((values, input) => {
          values[input.name] = input.value;

          return values
        },{})

        options.onSubmit(formValues);
      }
      // trường hợp sumit với hành vi mặc định của trình duyệt
      else {
        formElement.submit();
      }
    }
  }

  // lắng nghe sự kiện và xử lý các event của form (blur, ...) 
  if(formElement){
    options.rules.forEach(rule => {
      var inputElement = formElement.querySelector(rule.selector)

      // lưu lại các rules cho mỗi input
      if(Array.isArray(selectorRules[rule.selector])){
        selectorRules[rule.selector].push(rule.test)
      } else {
        selectorRules[rule.selector] = [rule.test]
      }
      
      if(inputElement){
        // Xử lý khi user blur
        inputElement.onblur = () => {
          Validate(inputElement, rule)
        
        // Xử lý khi user típ tục nhập
        inputElement.oninput = () => {
          getParentElement(inputElement,options.formGroupSelector).querySelector(options.errorSelector).innerHTML = ''
          getParentElement(inputElement,options.formGroupSelector).classList.remove('invalid')
        }
      }
    }})
  }
}

// Viết các rules
/*
  - Nếu có lỗi thì => Error Message
  - Nếu không có lỗi thì => undefined
*/
Validator.isRequired = function (selector, message){
  return{
    selector: selector,
    test: function(value) {
      return value.trim()? undefined : message|| 'Vui lòng nhập trường này!'
    }  
  }
}

Validator.isEmail = function (selector, message){
  return{
    selector: selector,
    test: function(value) {
      const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

      return regex.test(value)? undefined: message || "Trường này phải là email!"
    }  
  }
}

Validator.minLength = function (selector, min, message) {
  return{
    selector: selector,
    test: function(value) {
      return value.length >= min? undefined: message || `Vui lòng nhập tối thiểu ${min} ký tự`
    }  
  }
}

Validator.isConfirmed = function (selector, getConfirmed, message) {

  return{
    selector: selector,
    test: function(value) {
      return value === getConfirmed()? undefined: message || 'Giá trị nhập vào không chính xác!'
    }  
  }
}