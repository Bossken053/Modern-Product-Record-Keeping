const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user")
);


/* =========================
   CHECK LOGIN
========================= */

if (!token || !user) {

    window.location.href = "login.html";

}


/* =========================
   USER INFORMATION
========================= */

const userName =
    document.getElementById("userName");

const userRole =
    document.getElementById("userRole");

const userAvatar =
    document.getElementById("userAvatar");


if (user) {

    userName.textContent =
        user.fullName || "User";

    userRole.textContent =
        user.role || "user";


    if (user.fullName) {

        userAvatar.textContent =
            user.fullName
                .charAt(0)
                .toUpperCase();

    }

}


/* =========================
   ADMIN LINK
========================= */

const adminLink =
    document.getElementById("adminLink");


if (user && user.role === "admin") {

    adminLink.classList.remove("hidden");

}


/* =========================
   VARIABLES
========================= */

let allProducts = [];

let filteredProducts = [];


/* =========================
   GET PRODUCTS
========================= */

async function getProducts() {

    const productsList =
        document.getElementById(
            "productsList"
        );

    try {

        productsList.innerHTML = `

            <div class="loading-card">

                <div class="loader"></div>

                <p>
                    Loading products...
                </p>

            </div>

        `;


        const response =
            await fetch(
                `${API_URL}/products/getProduct`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to get products"
            );

        }


        /*
         * Depending on your controller,
         * the products may be returned as:
         *
         * data.products
         * OR
         * data.data
         * OR
         * directly as an array.
         */

        if (Array.isArray(data)) {

            allProducts = data;

        } else {

            allProducts =
                data.products ||
                data.data ||
                [];

        }


        filteredProducts =
            [...allProducts];


        updateStatistics();

        displayProducts(
            filteredProducts
        );

    } catch (error) {

        console.error(error);


        productsList.innerHTML = `

            <div class="loading-card">

                <h3>
                    Unable to load products
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


/* =========================
   DISPLAY PRODUCTS
========================= */

function displayProducts(products) {

    const productsList =
        document.getElementById(
            "productsList"
        );

    const noProducts =
        document.getElementById(
            "noProducts"
        );


    productsList.innerHTML = "";


    if (!products.length) {

        noProducts.classList.remove(
            "hidden"
        );

        return;

    }


    noProducts.classList.add(
        "hidden"
    );


    products.forEach(product => {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "product-card";


        const quantity =
            Number(product.quantity) || 0;


        const isAvailable =
            quantity > 0;


        const stockClass =
            isAvailable
                ? "in-stock"
                : "out-stock";


        const stockText =
            isAvailable
                ? "In Stock"
                : "Out of Stock";


        const editButton =
            user.role === "admin"
                ? `

                    <button
                        class="edit-btn"
                        onclick="openEditModal(
                            '${product._id}'
                        )"
                    >
                        Edit
                    </button>

                `
                : "";


        card.innerHTML = `

            <div class="product-top">

                🛍️

            </div>


            <div class="product-content">

                <h3>
                    ${escapeHTML(
                        product.name ||
                        "Unnamed Product"
                    )}
                </h3>


                <p class="product-description">

                    ${escapeHTML(
                        product.description ||
                        "No description available."
                    )}

                </p>


                <div class="product-bottom">

                    <span class="product-price">

                        ₦${formatPrice(
                            product.price
                        )}

                    </span>


                    <span
                        class="stock ${stockClass}"
                    >

                        ${stockText}

                    </span>

                </div>


                <div class="product-footer">

                    <span class="quantity">

                        Quantity:
                        ${quantity}

                    </span>

                    ${editButton}

                </div>

            </div>

        `;


        productsList.appendChild(
            card
        );

    });


    document.getElementById(
        "resultText"
    ).textContent =
        `Showing ${products.length} product${
            products.length === 1
                ? ""
                : "s"
        }`;

}


/* =========================
   UPDATE STATISTICS
========================= */

function updateStatistics() {

    const total =
        allProducts.length;


    const available =
        allProducts.filter(
            product =>
                Number(product.quantity) > 0
        ).length;


    const outOfStock =
        total - available;


    document.getElementById(
        "totalProducts"
    ).textContent =
        total;


    document.getElementById(
        "availableProducts"
    ).textContent =
        available;


    document.getElementById(
        "outOfStock"
    ).textContent =
        outOfStock;

}


/* =========================
   SEARCH
========================= */

const searchInput =
    document.getElementById(
        "searchInput"
    );


searchInput.addEventListener(
    "input",
    function () {

        const search =
            this.value
                .toLowerCase()
                .trim();


        filteredProducts =
            allProducts.filter(
                product => {

                    const name =
                        (
                            product.name ||
                            ""
                        ).toLowerCase();


                    const description =
                        (
                            product.description ||
                            ""
                        ).toLowerCase();


                    return (
                        name.includes(search) ||
                        description.includes(search)
                    );

                }
            );


        displayProducts(
            filteredProducts
        );

    }
);


/* =========================
   SORT PRODUCTS
========================= */

const sortProducts =
    document.getElementById(
        "sortProducts"
    );


sortProducts.addEventListener(
    "change",
    function () {

        const value =
            this.value;


        filteredProducts =
            [...filteredProducts];


        if (value === "name") {

            filteredProducts.sort(
                (a, b) =>
                    (a.name || "")
                        .localeCompare(
                            b.name || ""
                        )
            );

        }


        if (value === "price-low") {

            filteredProducts.sort(
                (a, b) =>
                    Number(a.price) -
                    Number(b.price)
            );

        }


        if (value === "price-high") {

            filteredProducts.sort(
                (a, b) =>
                    Number(b.price) -
                    Number(a.price)
            );

        }


        if (value === "quantity") {

            filteredProducts.sort(
                (a, b) =>
                    Number(b.quantity) -
                    Number(a.quantity)
            );

        }


        displayProducts(
            filteredProducts
        );

    }
);


/* =========================
   REFRESH
========================= */

document.getElementById(
    "refreshBtn"
).addEventListener(
    "click",
    function () {

        getProducts();

    }
);


/* =========================
   EDIT PRODUCT MODAL
========================= */

function openEditModal(id) {

    const product =
        allProducts.find(
            item =>
                item._id === id
        );


    if (!product) {

        alert("Product not found.");

        return;

    }


    document.getElementById(
        "editProductId"
    ).value =
        product._id;


    document.getElementById(
        "editName"
    ).value =
        product.name || "";


    document.getElementById(
        "editDescription"
    ).value =
        product.description || "";


    document.getElementById(
        "editPrice"
    ).value =
        product.price || 0;


    document.getElementById(
        "editQuantity"
    ).value =
        product.quantity || 0;


    document.getElementById(
        "editModal"
    ).classList.remove(
        "hidden"
    );

}


/* =========================
   CLOSE MODAL
========================= */

document.getElementById(
    "closeModal"
).addEventListener(
    "click",
    function () {

        document.getElementById(
            "editModal"
        ).classList.add(
            "hidden"
        );

    }
);


/* =========================
   EDIT PRODUCT
========================= */

document.getElementById(
    "editProductForm"
).addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        const id =
            document.getElementById(
                "editProductId"
            ).value;


        const name =
            document.getElementById(
                "editName"
            ).value;


        const description =
            document.getElementById(
                "editDescription"
            ).value;


        const price =
            document.getElementById(
                "editPrice"
            ).value;


        const quantity =
            document.getElementById(
                "editQuantity"
            ).value;


        const message =
            document.getElementById(
                "editMessage"
            );


        try {

            const response =
                await fetch(
                    `${API_URL}/products/${id}`,
                    {

                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({

                                name,

                                description,

                                price:
                                    Number(price),

                                quantity:
                                    Number(quantity)

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Unable to update product.";

                message.style.color =
                    "red";

                return;

            }


            message.textContent =
                "Product updated successfully.";

            message.style.color =
                "green";


            setTimeout(
                function () {

                    document.getElementById(
                        "editModal"
                    ).classList.add(
                        "hidden"
                    );


                    getProducts();

                },
                800
            );


        } catch (error) {

            console.error(error);

            message.textContent =
                "Server connection failed.";

            message.style.color =
                "red";

        }

    }
);


/* =========================
   LOGOUT
========================= */

document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );


        window.location.href =
            "login.html";

    }
);


/* =========================
   FORMAT PRICE
========================= */

function formatPrice(price) {

    return Number(price || 0)
        .toLocaleString("en-NG");

}


/* =========================
   SECURITY
========================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


getProducts();