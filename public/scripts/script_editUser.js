
function showPreview(event){
    if(event.target.files.length > 0){
      var src = URL.createObjectURL(event.target.files[0]);
      var preview = document.getElementById("img-upload-preview");
      preview.src = src;
      preview.style.display = "block";
    }
  }


function validation()
{
    var username = document.getElementById("name").value;
    var profession = document.getElementById("profession").value;    
    var phone = document.getElementById("phone").value;    
    var email = document.getElementById("email").value;    
    var dob = document.getElementById("dob").value;    
    var status = document.getElementById("status").value;    
    var gender = document.getElementById("gender").value;

    

    alert(username);
    if(allLettername(username))   
    {
        alert("success2");
        if(allLetterprofession(profession))
        {
            if(allnumeric(phone))
            {
                if(ValidateEmail(email))
                {
                    if(validatedate(dob))
                    {
                        if(validatestatus(status))
                        {
                            if(Validategender(gender))
                            {
                                return true;
                            } 
                        }
                    } 
                }
            }
        }
    }
    return false;
}


function allLettername(name)
{ 
    var letters = /^[A-Za-z]+$/;
    if(name.match(letters))
    {
        return true;
    }
    else
    {
        alert('Name must have alphabet characters only');
        document.getElementById("name").focus();
        return false;
    }
}

function allLetterprofession(pro)
{ 
    var letters = /^[A-Za-z]+$/;
    if(pro.match(letters))
    {
        return true;
    }
    else
    {
        alert('Profession must have alphabet characters only');
        document.getElementById("profession").focus();
        return false;
    }
}

function allnumeric(phone)
{ 
    var numbers = /^[0-9]+$/;
    if(phone.match(numbers))
    {
        return true;
    }
    else
    {
        alert('Phone number must have numeric characters only');
        document.getElementById("phone").focus();
        return false;
    }
}

function ValidateEmail(email)
{
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(email.match(mailformat))
    {
        return true;
    }
    else
    {
        alert("You have entered an invalid email address!");
        document.getElementById("email").focus();
        return false;   
    }
}

function validatestatus(status)
{
    if(status == "select")
    {
        alert('Select your status from the list');
        document.getElementById("status").focus();
        return false;
    }
    else
    {
       return true;
    }
}

function Validategender(gender)
{
    if(gender == "select")
    {
        alert('Select your gender from the list');
        document.getElementById("gender").focus();
        return false;
    }
    else
    {
       return true;
    }
}

