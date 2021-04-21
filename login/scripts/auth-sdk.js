try {
  function sendAction(payload) {
    window.top.postMessage(JSON.stringify(payload), "*");
  }

  function initLoginWithEmailFunction() {
    try {
      // Login with email
      const form = document.querySelector('form[data-gevme-form="gevme-form"]');
      const heading = document.querySelector(
        'div[data-gevme-heading="data-gevme-heading-h2"]'
      );
      const loginForm = document.querySelector(
        'div[data-gevme-form="gevme-login"]'
      );
      const email = document.querySelector(
        'input[data-gevme-input="gevme-email"]'
      );
      const submitForm = document.querySelector(
        'input[data-gevme-input="gevme-submit"]'
      );
      const generalError = document.querySelector('p[data-error="general"]');
      const emailError = document.querySelector(`p[data-error="email"]`);
      const otpForm = document.querySelector(
        'div[data-gevme-form="gevme-otp"]'
      );
      const otpError = document.querySelector(`p[data-error="otp"]`);
      const otpBack = document.querySelector(
        'a[data-gevme-anchor="gevme-back"]'
      );

      const membershipFormWrap = document.querySelector(
        'div[data-gevme-form="gevme-membership"]'
      );
      const membershipError = document.querySelector(
        `p[data-error="memberid"]`
      );
      const membershipBack = document.querySelector(
        'a[data-gevme-anchor="gevme-back-otp"]'
      );

      if (otpBack) {
        otpBack.addEventListener("click", function (e) {
          e.preventDefault();

          otpForm.style.display = "none";
          loginForm.style.display = "flex";
          heading.style.display = "block";
          email.classList.remove("input-error", "email-error");
          submitForm.removeAttribute("disabled");
        });
      }

      if (membershipBack) {
        membershipBack.addEventListener("click", function (e) {
          e.preventDefault();
          membershipFormWrap.style.display = "none";
          otpForm.style.display = "none";
          loginForm.style.display = "flex";
          heading.style.display = "block";
          email.classList.remove("input-error", "email-error");
          submitForm.removeAttribute("disabled");
        });
      }

      if (email) {
        email.addEventListener("keydown", function () {
          email.classList.remove("input-error", "email-error");
          emailError.textContent = "";
        });
      }

      if (form) {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          const data = new FormData(form);
          let payload = { type: "loginWithEmail" };

          for (const [name, value] of data) {
            payload = { ...payload, [name]: value };
          }

          if (payload.email === "") {
            email.classList.add("input-error", "email-error");
            return (emailError.textContent = "Please enter the email address");
          }

          if (!validateEmail(payload.email)) {
            email.classList.add("input-error", "email-error");
            return (emailError.textContent =
              "Please enter the correct email format.");
          }
          generalError.textContent = "";
          form.classList.add("form-submitted", "form-loading");
          email.classList.remove("input-error", "email-error");
          submitForm.setAttribute("disabled", true);
          submitForm.textContent = "Checking in...";
          return sendAction(payload);
        });
      }

      function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      }

      function renderOTPInput(payload) {
        try {
          const pHead = otpForm.querySelector('p[data-gevme-p="gevme-p"]');
          const otpWrap = document.querySelector("#otp-wrap");
          otpWrap.innerHTML = "";

          for (
            let inputNum = 0;
            inputNum < parseInt(otpWrap.dataset.otpLength);
            inputNum++
          ) {
            const createdInput = document.createElement("input");
            createdInput.type = "number";
            createdInput.id = `input-${inputNum}`;
            createdInput.maxLength = 1;
            otpWrap.append(createdInput);
          }
          const inputs = document.querySelectorAll("#otp-wrap > *[id]");
          let num = {};
          const regex = /[0-9]|\./;

          form.parentElement.style.display = "none";
          heading.style.display = "none";
          otpForm.style.display = "flex";
          otpError.textContent =
            payload.type === "error" ? payload?.data?.message : "";
          pHead.textContent = payload?.message || "";

          for (let i = 0; i < inputs.length; i++) {
            inputs[i].value = "";
            inputs[i].addEventListener("keydown", function keyEvent(event) {
              otpError.textContent = "";
              if (event.key === "Backspace") {
                inputs[i].value = "";
                if (i !== 0) inputs[i - 1].focus();
              } else {
                if (!regex.test(event.key)) {
                  event.preventDefault();
                  return false;
                }
                if (i === inputs.length - 1 && inputs[i].value !== "") {
                  return true;
                } else if (
                  (event.keyCode > 47 && event.keyCode < 58) ||
                  (event.keyCode >= 48 && event.keyCode <= 57) ||
                  (event.keyCode >= 96 && event.keyCode <= 105) ||
                  (event.keyCode === 229 && event.key === "Unidentified")
                ) {
                  inputs[i].value = event.key;
                  if (i !== inputs.length - 1) inputs[i + 1].focus();
                  event.preventDefault();
                } else if (
                  (event.keyCode > 64 && event.keyCode < 91) ||
                  (event.keyCode >= 48 && event.keyCode <= 57) ||
                  (event.keyCode >= 96 && event.keyCode <= 105) ||
                  (event.keyCode === 229 && event.key === "Unidentified")
                ) {
                  inputs[i].value = String.fromCharCode(event.keyCode);
                  if (i !== inputs.length - 1) inputs[i + 1].focus();
                  event.preventDefault();
                }
              }

              num[`${i}`] = inputs[i].value;

              if (
                Object.keys(num).length > 3 &&
                Object.values(num).every((x) => x !== null && x !== "")
              ) {
                let otp = "";
                Object.values(num).map((e) => (otp = `${otp}` + `${e}`));
                otpForm.classList.add("form-submitted", "form-loading");
                num = {};

                inputs[0].focus();

                return sendAction({
                  ...payload,
                  code: otp,
                  type: "otp",
                });
              }
            });
          }
        } catch (error) {
          console.error(error);
        }
      }

      function renderMembershipForm(payload) {
        try {
          const membershipForm = document.querySelector(
            'form[data-gevme-login-type="login-with-email-otp2"]'
          );
          const memeberInputWrap = document.querySelector("#membership-input");
          memeberInputWrap.innerHTML = "";

          const membershipInput = document.createElement("input");
          membershipInput.id = "membershipInput";
          membershipInput.type = "text";
          membershipInput.required = "true";
          membershipInput.name = "code";
          membershipInput.placeholder = "Member ID";
          memeberInputWrap.append(membershipInput);

          otpForm.style.display = "none";
          membershipFormWrap.style.display = "flex";
          membershipError.textContent =
            payload.type === "error" ? payload?.data?.message : "";

          membershipInput.addEventListener("keydown", function (e) {
            membershipError.textContent = "";
          });

          if (membershipForm) {
            membershipForm.addEventListener("submit", function (e) {
              e.preventDefault();
              const formData = new FormData(membershipForm);
              let updatedPayload = { ...payload, type: "validateCode" };

              for (const [name, value] of formData) {
                updatedPayload = { ...updatedPayload, [name]: value };
              }
              return sendAction(updatedPayload);
            });
          }
        } catch (error) {
          console.error(error);
        }
      }
      function handleResponseFromPlatform(e) {
        try {
          const payload =
            typeof e.data === "string" ? JSON.parse(e.data) : e.data;
          console.log("handleResponseFromPlatform: ", payload);
          form.classList.remove("form-submitted", "form-loading");

          if (payload) {
            if (payload.type === "error") {
              if (payload.data.errorType === "email") {
                email.classList.add("input-error", "email-error");
                submitForm.removeAttribute("disabled");
                emailError.textContent =
                  payload?.data?.message ||
                  "Something went wrong. Please try again.";
              }

              if (payload.data.errorType === "otp") {
                otpError.textContent =
                  payload?.data?.message ||
                  "Something went wrong. Please try again.";
              }

              if (payload.data.errorType === "otp2") {
                membershipError.textContent =
                  payload?.data?.message ||
                  "Something went wrong. Please try again.";
              }
            }

            if (payload.type === "login") {
              if (!payload.status) {
                submitForm.removeAttribute("disabled");
                return (generalError.textContent = payload?.message);
              }

              return typeof window.renderOTPInput !== "undefined"
                ? window.renderOTPInput(payload)
                : renderOTPInput(payload);
            }

            if (payload.type === "otp2") {
              return typeof window.renderMembershipForm !== "undefined"
                ? window.renderMembershipForm(payload)
                : renderMembershipForm(payload);
            }
          }
        } catch (error) {
          console.error(error.message);
          generalError.textContent = error.message;
        }
      }

      window.addEventListener("message", handleResponseFromPlatform);
    } catch (error) {
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", function () {
    // Run login function
    const form = document.querySelector('form[data-gevme-form="gevme-form"]');
    if (form) {
      switch (form.getAttribute("data-gevme-login-type").toLocaleLowerCase()) {
        case "login-with-email":
          initLoginWithEmailFunction();
          break;
      }
    }
  });
} catch (error) {
  console.error(error.message);
}
