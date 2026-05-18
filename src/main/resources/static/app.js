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

        await request(API + "/recipes", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                title: valueOf("title"),
                category: valueOf("category"),
                cookingTime: Number(valueOf("time")),
                description: valueOf("description"),
                userId: Number(userId)
            })
        });

        document.getElementById("title").value = "";
        document.getElementById("category").value = "";
        document.getElementById("time").value = "";
        document.getElementById("description").value = "";

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
            list.innerHTML += `
    <div class="card">
        <div class="card-header">
            <h3>${recipe.title}</h3>
            <button class="favorite-btn" onclick="favoriteRecipe(${recipe.id})">Favorite</button>
        </div>

        <p>${recipe.description}</p>

        <small>
            Posted by: ${recipe.author ? recipe.author.username : "Unknown"}
            <br>
            ${recipe.category} | ${recipe.cookingTime} min
            <br>
            Upvotes: ${recipe.upvotes} | Downvotes: ${recipe.downvotes}
            <br>
            Score: ${recipe.score}
        </small>

        <br><br>

        <button onclick="upvoteRecipe(${recipe.id})">Upvote</button>
        <button onclick="downvoteRecipe(${recipe.id})">Downvote</button>
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
                <p>${recipe.description}</p>
                <small>
                    ${recipe.category} | ${recipe.cookingTime} min
                    <br>
                    Upvotes: ${recipe.upvotes} | Downvotes: ${recipe.downvotes}
                    <br>
                    Score: ${recipe.score}
                </small>
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
                <p>${recipe.description}</p>
                <small>
                    Posted by: ${recipe.author ? recipe.author.username : "Unknown"}
                    <br>
                    ${recipe.category} | ${recipe.cookingTime} min
                    <br>
                    Upvotes: ${recipe.upvotes} | Downvotes: ${recipe.downvotes}
                    <br>
                    Score: ${recipe.score}
                </small>

                <br><br>

                <button onclick="unfavoriteRecipe(${recipe.id})">Remove from favorites</button>
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