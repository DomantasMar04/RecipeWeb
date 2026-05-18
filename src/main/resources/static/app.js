const API = "/api";

// SIGNUP
function signup() {
    fetch(API + "/auth/signup", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: username.value,
            email: email.value,
            password: password.value
        })
    })
        .then(r => r.text())
        .then(data => msg.innerText = data);
}

// LOGIN
function login() {
    fetch(API + "/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            email: email.value,
            password: password.value
        })
    })
        .then(r => r.text())
        .then(data => {
            msg.innerText = data;
            localStorage.setItem("user", data);

            // redirect
            setTimeout(() => {
                window.location.href = "/recipes.html";
            }, 500);
        });
}

// CREATE RECIPE
function createRecipe() {
    fetch(API + "/recipes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            title: title.value,
            category: category.value,
            cookingTime: time.value,
            description: description.value
        })
    })
        .then(r => r.json())
        .then(() => loadRecipes());
}

// LOAD RECIPES
function loadRecipes() {
    fetch(API + "/recipes")
        .then(r => r.json())
        .then(data => {
            list.innerHTML = "";

            data.forEach(r => {
                list.innerHTML += `
                <div class="card">
                    <h3>${r.title}</h3>
                    <p>${r.description}</p>
                    <small>${r.category} | ${r.cookingTime} min</small>
                </div>
            `;
            });
        });
}

// auto load
if (window.location.pathname.includes("recipes")) {
    loadRecipes();
}