const API = "/api";

function valueOf(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
}

function showMessage(text) {
    const msg = document.getElementById("msg");
    if (msg) msg.innerText = text;
}

async function request(url, options = {}) {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    if (contentType.includes("application/json")) {
        return response.json();
    }

    return response.text();
}

// SIGNUP
async function signup() {
    try {
        const data = await request(API + "/auth/signup", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username: valueOf("username"),
                email: valueOf("email"),
                password: valueOf("password")
            })
        });

        if (typeof data === "string") {
            showMessage(data);
            return;
        }

        localStorage.setItem("userId", data.id);
        localStorage.setItem("username", data.username);
        localStorage.setItem("email", data.email);
        localStorage.setItem("token", data.token);

        window.location.href = "/recipes.html";

    } catch (error) {
        showMessage(error.message);
    }
}

// LOGIN
async function login() {
    try {
        const data = await request(API + "/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: valueOf("email"),
                password: valueOf("password")
            })
        });

        if (typeof data === "string") {
            showMessage(data);
            return;
        }

        localStorage.setItem("userId", data.id);
        localStorage.setItem("username", data.username);
        localStorage.setItem("email", data.email);
        localStorage.setItem("token", data.token);

        showMessage("Login successful");

        window.location.href = "/recipes.html";
    } catch (error) {
        showMessage(error.message);
    }
}

// CREATE RECIPE
async function createRecipe() {
    try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
            alert("You must login first");
            window.location.href = "/login.html";
            return;
        }

        const title = valueOf("title");
        const category = valueOf("category");
        const time = valueOf("time");
        const description = valueOf("description");

        // validation
        if (!title || !category || !time || !description) {
            alert("Užpildykite visus laukus");
            return;
        }

        if (title.length < 3) {
            alert("Pavadinimas turi būti bent 3 simboliai");
            return;
        }

        if (description.length < 10) {
            alert("Aprašymas turi būti bent 10 simbolių");
            return;
        }

        if (Number(time) < 1) {
            alert("Gaminimo laikas turi būti bent 1 min");
            return;
        }

        await request(API + "/recipes", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                title,
                category,
                cookingTime: Number(time),
                description,
                userId: Number(userId)
            })
        });

        document.getElementById("title").value = "";
        document.getElementById("category").value = "";
        document.getElementById("time").value = "";
        document.getElementById("description").value = "";

        currentEditingRecipeId = null;

        loadRecipes();
    } catch (error) {
        alert(error.message);
    }
}
// LOAD RECIPES
async function loadRecipes() {
    const list = document.getElementById("list");
    if (!list) return;

    try {
        const data = await request(API + "/recipes");

        list.innerHTML = "";

        data.forEach(recipe => {
            const currentUserId = localStorage.getItem("userId");

            // Tikriname, ar prisijungęs vartotojas yra šio recepto autorius
            let editButtonHtml = "";
            if (recipe.author && recipe.author.id == currentUserId) {
                // Kadangi tekste gali būti kabučių, jas saugiai pakeičiame, kad nesulaužytų HTML
                const safeTitle = recipe.title.replace(/'/g, "\\'");
                const safeCategory = recipe.category.replace(/'/g, "\\'");
                const safeDesc = recipe.description.replace(/'/g, "\\'");

                editButtonHtml = `
            <button class="btn btn-outline btn-sm" style="margin-left: 10px; border-color: #ffa500; color: #ffa500;"
                onclick="prepareEditRecipe(${recipe.id}, '${safeTitle}', '${safeCategory}', ${recipe.cookingTime}, '${safeDesc}')">
                ✏️ Redaguoti
            </button>
        `;
            }

            list.innerHTML += `
    <div class="card">
        <div class="card-header">
            <h3>${recipe.title}</h3>
            <button 
                class="btn ${recipe.favorite ? "btn-primary" : "btn-outline"} btn-sm"
                onclick="favoriteRecipe(${recipe.id})"
            >
                ${recipe.favorite ? "❤️ Išsaugota" : "🤍 Išsaugoti"}
            </button>
        </div>

        <div class="card-meta">
            <span class="badge">🍽 ${recipe.category}</span>
            <span class="badge">⏱ ${recipe.cookingTime} min</span>
        </div>

        <p class="card-desc">${recipe.description}</p>

        <div class="card-author">Autorius: ${recipe.author ? recipe.author.username : "Nežinomas"}</div>

        <div class="card-votes">
            <button class="btn btn-upvote btn-sm" onclick="upvoteRecipe(${recipe.id})">▲ ${recipe.upvotes}</button>
            <button class="btn btn-downvote btn-sm" onclick="downvoteRecipe(${recipe.id})">▼ ${recipe.downvotes}</button>
            <span class="vote-score">Score: ${recipe.score}</span>
            ${editButtonHtml} </div>
    </div>
    `;
        });
    } catch (error) {
        list.innerHTML = `<p>${error.message}</p>`;
    }
}

async function upvoteRecipe(id) {
    try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
            alert("You must login first");
            window.location.href = "/login.html";
            return;
        }

        const data = await request(API + "/recipes/" + id + "/upvote", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                userId: Number(userId)
            })
        });

        if (!data) {
            alert("You cannot vote for your own recipe");
            return;
        }

        loadRecipes();
    } catch (error) {
        alert(error.message);
    }
}

async function downvoteRecipe(id) {
    try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
            alert("You must login first");
            window.location.href = "/login.html";
            return;
        }

        const data = await request(API + "/recipes/" + id + "/downvote", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                userId: Number(userId)
            })
        });

        if (!data) {
            alert("You cannot vote for your own recipe");
            return;
        }

        loadRecipes();
    } catch (error) {
        alert(error.message);
    }
}

async function loadProfile() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("You must login first");
        window.location.href = "/login.html";
        return;
    }

    try {
        const user = await request(API + "/users/" + userId);

        document.getElementById("profileUsername").innerText = user.username;
        document.getElementById("profileEmail").innerText = user.email;

        const recipes = await request(API + "/users/" + userId + "/recipes");

        showMyRecipes(recipes);
        showStatistics(recipes);

        const favorites = await request(API + "/users/" + userId + "/favorites");

        showFavoriteRecipes(favorites);

    } catch (error) {
        alert(error.message);
    }
}

function showMyRecipes(recipes) {
    const myRecipes = document.getElementById("myRecipes");
    myRecipes.innerHTML = "";

    if (recipes.length === 0) {
        myRecipes.innerHTML = "<p>You have not posted recipes yet.</p>";
        return;
    }

    recipes.forEach(recipe => {
        myRecipes.innerHTML += `
            <div class="card">
                <h3>${recipe.title}</h3>
                <div class="card-meta">
                    <span class="badge">🍽 ${recipe.category}</span>
                    <span class="badge">⏱ ${recipe.cookingTime} min</span>
                </div>
                <p class="card-desc">${recipe.description}</p>
                <div class="card-votes">
                    <span class="btn btn-upvote btn-sm">▲ ${recipe.upvotes}</span>
                    <span class="btn btn-downvote btn-sm">▼ ${recipe.downvotes}</span>
                    <span class="vote-score">Score: ${recipe.score}</span>
                </div>
                <div style="margin-top: 12px; display: flex; gap: 8px;">
                    <button class="btn btn-sm" style="background-color: #dc3545; color: white; border: none;"
                        onclick="deleteRecipe(${recipe.id})">
                        🗑️ Ištrinti
                    </button>
                </div>
            </div>
        `;
    });
}

function showFavoriteRecipes(recipes) {
    const favoriteRecipes = document.getElementById("favoriteRecipes");
    favoriteRecipes.innerHTML = "";

    if (recipes.length === 0) {
        favoriteRecipes.innerHTML = "<p>You have not favorited recipes yet.</p>";
        return;
    }

    recipes.forEach(recipe => {
        favoriteRecipes.innerHTML += `
            <div class="card">
                <h3>${recipe.title}</h3>
                <div class="card-meta">
                    <span class="badge">🍽 ${recipe.category}</span>
                    <span class="badge">⏱ ${recipe.cookingTime} min</span>
                </div>
                <p class="card-desc">${recipe.description}</p>
                <div class="card-author">Autorius: ${recipe.author ? recipe.author.username : "Nežinomas"}</div>
                <div class="card-votes">
                    <span class="btn btn-upvote btn-sm">▲ ${recipe.upvotes}</span>
                    <span class="btn btn-downvote btn-sm">▼ ${recipe.downvotes}</span>
                    <span class="vote-score">Score: ${recipe.score}</span>
                </div>
                <button class="btn btn-outline btn-sm" onclick="unfavoriteRecipe(${recipe.id})">✕ Pašalinti iš mėgstamų</button>
            </div>
        `;
    });
}

function showStatistics(recipes) {
    let totalUpvotes = 0;
    let totalDownvotes = 0;
    let overallScore = 0;
    let topRecipe = null;

    recipes.forEach(recipe => {
        totalUpvotes += recipe.upvotes;
        totalDownvotes += recipe.downvotes;
        overallScore += recipe.score;

        if (topRecipe === null || recipe.score > topRecipe.score) {
            topRecipe = recipe;
        }
    });

    document.getElementById("totalRecipes").innerText = recipes.length;
    document.getElementById("totalUpvotes").innerText = totalUpvotes;
    document.getElementById("totalDownvotes").innerText = totalDownvotes;
    document.getElementById("overallScore").innerText = overallScore;

    if (topRecipe === null) {
        document.getElementById("topRecipe").innerText = "No recipes yet";
    } else {
        document.getElementById("topRecipe").innerText = topRecipe.title + " with score " + topRecipe.score;
    }
}

async function favoriteRecipe(id) {
    try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
            alert("You must login first");
            window.location.href = "/login.html";
            return;
        }

        const message = await request(API + "/recipes/" + id + "/favorite", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                userId: Number(userId)
            })
        });

        alert(message);
    } catch (error) {
        alert(error.message);
    }
}

async function unfavoriteRecipe(id) {
    try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
            alert("You must login first");
            window.location.href = "/login.html";
            return;
        }

        const message = await request(API + "/recipes/" + id + "/favorite/" + userId, {
            method: "DELETE"
        });

        alert(message);

        if (window.location.pathname.includes("profile")) {
            loadProfile();
        }
    } catch (error) {
        alert(error.message);
    }
}

function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("token");

    window.location.href = "/login.html";
}

if (window.location.pathname.includes("recipes")) {
    loadRecipes();
}
if (window.location.pathname.includes("profile")) {
    loadProfile();
}
// Šis kintamasis saugo redaguojamo recepto ID
let currentEditingRecipeId = null;


// 1. Užpildo formą recepto duomenimis, kai paspaudi "Redaguoti"
function prepareEditRecipe(id, title, category, cookingTime, description) {
    currentEditingRecipeId = id;

    document.getElementById("title").value = title;
    document.getElementById("category").value = category;
    document.getElementById("time").value = cookingTime;
    document.getElementById("description").value = description;

    const updateBtn = document.getElementById("updateBtn");
    if (updateBtn) {
        updateBtn.disabled = false;
        updateBtn.innerText = "Atnaujinti receptą";
    }

    const createBtn = document.getElementById("createBtn");
    if (createBtn) createBtn.style.display = "none";
}

// 2. Vykdo TIK atnaujinimo (PUT) užklausą
async function updateRecipe() {
    // Jei vartotojas bando spausti mygtuką, bet nepaspaudė "Redaguoti" ant jokio recepto
    if (currentEditingRecipeId === null) {
        alert("Pirmiausia receptų sąraše paspauskite '✏️ Redaguoti' prie norimo recepto!");
        return;
    }

    try {
        const userId = localStorage.getItem("userId");
        const title = valueOf("title");
        const category = valueOf("category");
        const time = valueOf("time");
        const description = valueOf("description");

        // Validacija
        if (!title || !category || !time || !description) {
            alert("Užpildykite visus laukus");
            return;
        }

        // Siunčiame PUT užklausą į Back-end atnaujinimui
        await request(API + "/recipes/" + currentEditingRecipeId, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                title,
                category,
                cookingTime: Number(time),
                description,
                userId: Number(userId) // Reikalinga saugumo patikrai serveryje
            })
        });

        alert("Receptas sėkmingai atnaujintas!");

        // Išvalome formą ir atstatome kintamąjį į pradinę būseną
        currentEditingRecipeId = null;
        document.getElementById("title").value = "";
        document.getElementById("category").value = "";
        document.getElementById("time").value = "";
        document.getElementById("description").value = "";

        const updateBtn = document.getElementById("updateBtn");
        if (updateBtn) {
            updateBtn.disabled = true;
            updateBtn.innerText = "Atnaujinti receptą";
        }

        const createBtn = document.getElementById("createBtn");
        if (createBtn) createBtn.style.display = "";

        // Perkeliame/atnaujiname sąrašą ekrane
        loadRecipes();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteRecipe(id) {
    // Saugumo sumetimais paklausiame vartotojo, ar jis tikrai nori trinti
    if (!confirm("Ar tikrai norite ištrinti šį receptą visam laikui?")) {
        return;
    }

    try {
        // Siunčiame DELETE užklausą adresu /api/recipes/{id}
        const message = await request(API + "/recipes/" + id, {
            method: "DELETE"
        });

        alert("Receptas sėkmingai ištrintas!");

        // Kadangi ištrynėme receptą, iš naujo perkrauname profilio duomenis ir sąrašus
        if (window.location.pathname.includes("profile")) {
            loadProfile();
        } else if (typeof loadRecipes === "function") {
            loadRecipes();
        }
    } catch (error) {
        alert("Nepavyko ištrinti recepto: " + error.message);
    }
}