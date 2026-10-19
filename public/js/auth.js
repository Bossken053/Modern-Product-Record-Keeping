
const form = document.getElementById('registerForm');
    form.addEventListener("submit", async(e) => {
    e.preventDefault(); //stops windows reload
    
    const fullName = document.getElementById('fullName').value
    const email = document.getElementById ('email').value
    const phone = document.getElementById ('phone').value
    const password = document.getElementById ('password').value
    const confirmPassword = document.getElementById ('confirmPassword').value;

    
    if (password!== confirmPassword) {
        alert ("password did not match");
        return;
    }

    const formData = new formData();

    formData.append ("fullName", fullName)
    formData.append ("email", email)
    formData.append ("phone", phone)
    formData.append ("password", password)
    formData.append ("confirmPassword", confirmPassword)

    try{
        const response = await fetch("/api/auth/register-user",{
            method: "POST",
            body: formData,
        })
        const data = await response.json();
        if(response.ok){
            alert ("registration successful")
            window.location.href = "login.html"
        } else{
            alert('registration Failed')
        }
    } catch(error){
        alert("server error")
    }
});



// login
