const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user")
);


/* CHECK LOGIN */

if (!token || !user) {

    window.location.href = "../login.html";

}


/* CHECK ADMIN */

if (user && user.role !== "admin") {

    alert("Access denied. Admin only.");

    window.location.href = "../products.html";

}


/* DISPLAY ADMIN NAME */

const adminName =
    document.getElementById("adminName");

if (adminName && user) {

    adminName.textContent =
        user.fullName;

}


/* CHANGE SECTION */

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(
            ".content-section"
        );

    sections.forEach(section => {

        section.classList.remove(
            "active-section"
        );

    });


    const selectedSection =
        document.getElementById(sectionId);

    if (selectedSection) {

        selectedSection.classList.add(
            "active-section"
        );

    }


    /* UPDATE PAGE TITLE */

    const pageTitle =
        document.getElementById("pageTitle");


    const titles = {

        dashboard: "Dashboard",

        "create-product":
            "Create Product",

        products:
            "View Products",

        users:
            "Users"

    };


    if (pageTitle) {

        pageTitle.textContent =
            titles[sectionId];

    }


    /* UPDATE ACTIVE SIDEBAR */

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(item => {

        item.classList.remove("active");

    });


    navItems.forEach(item => {

        if (
            item.getAttribute("onclick") &&
            item.getAttribute("onclick")
                .includes(sectionId)
        ) {

            item.classList.add("active");

        }

    });


    if (sectionId === "products") {

        getProducts();

    }


    if (sectionId === "users") {

        getUsers();

    }


    if (sectionId === "dashboard") {

        loadDashboard();

    }

}


/* CREATE PRODUCT */

const productForm =
    document.getElementById("productForm");


if (productForm) {

    productForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const name =
                document.getElementById(
                    "name"
                ).value;

            const description =
                document.getElementById(
                    "description"
                ).value;

            const price =
                document.getElementById(
                    "price"
                ).value;

            const quantity =
                document.getElementById(
                    "quantity"
                ).value;

        const imageInput =
    document.getElementById("image");

const imagePreview =
    document.getElementById("imagePreview");


imageInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        if (!file) {

            imagePreview.style.display =
                "none";

            return;

        }


        const imageURL =
            URL.createObjectURL(file);


        imagePreview.src =
            imageURL;

        imagePreview.style.display =
            "block";

    }
);







            const message =
                document.getElementById(
                    "productMessage"
                );


            try {

                const response =
                    await fetch(
                        `${API_URL}/products/`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",
    credentials: "include"
        

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


                if (response.ok) {

                    message.textContent =
                        "Product created successfully.";

                    message.style.color =
                        "green";

                    productForm.reset();

                    loadDashboard();

                } else {

                    message.textContent =
                        data.message ||
                        "Unable to create product.";

                    message.style.color =
                        "red";

                }

            } catch (error) {

                console.error(error);

                message.textContent =
                    "Server connection failed.";

                message.style.color =
                    "red";

            }

        }
    );

}


/* GET PRODUCTS */

async function getProducts() {

    const table =
        document.getElementById(
            "productsTable"
        );


    try {

        const response =
            await fetch(
                `${API_URL}/products/getProduct`,
                {

                    method: "GET",
                    credentials: "include"

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            table.innerHTML =
                `<tr>
                    <td colspan="4">
                        ${data.message}
                    </td>
                </tr>`;

            return;

        }


        const products =
            data.products ||
            data.data ||
            [];


        table.innerHTML = "";


        products.forEach(product => {

            table.innerHTML += `

                <tr>

                    <td>
                        <strong>
                            ${product.name}
                        </strong>
                    </td>

                    <td>
                        ${product.description}
                    </td>

                    <td>
                        ₦${product.price}
                    </td>

                    <td>
                        ${product.quantity}
                    </td>
                    
                    <td>
                        ${product.image}
                    </td>

                </tr>

            `;

        });


        document.getElementById(
            "totalProducts"
        ).textContent =
            products.length;


        document.getElementById(
            "availableProducts"
        ).textContent =
            products.filter(
                product =>
                    product.quantity > 0
            ).length;


        /* RECENT PRODUCTS */

        const recent =
            document.getElementById(
                "recentProducts"
            );


        recent.innerHTML = "";


        products.slice(0, 5)
            .forEach(product => {

                recent.innerHTML += `

                    <div style="
                        padding: 15px;
                        border-bottom:
                        1px solid #eee;
                    ">

                        <strong>
                            ${product.name}
                        </strong>

                        <p>
                            ₦${product.price}
                        </p>

                    </div>

                `;

            });


    } catch (error) {

        console.error(error);

        table.innerHTML =
            `<tr>
                <td colspan="4">
                    Unable to load products.
                </td>
            </tr>`;

    }

}


/* GET USERS */

async function getUsers() {

    const table =
        document.getElementById(
            "usersTable"
        );


    try {

        const response =
            await fetch(
                `${API_URL}/users/getUser`,
                {
                    method:"GET",
                    credentials: "include"

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            table.innerHTML =
                `<tr>
                    <td colspan="4">
                        ${data.message}
                    </td>
                </tr>`;

            return;

        }


        const users =
            data.users ||
            data.data ||
            [];


        table.innerHTML = "";


        users.forEach(person => {

            table.innerHTML += `

                <tr>

                    <td>
                        ${person.fullName}
                    </td>

                    <td>
                        ${person.email}
                    </td>

                    <td>
                        ${person.phone}
                    </td>

                    <td>
                        ${person.role}
                    </td>

                </tr>

            `;

        });


        document.getElementById(
            "totalUsers"
        ).textContent =
            users.length;


    } catch (error) {

        console.error(error);

        table.innerHTML =
            `<tr>
                <td colspan="4">
                    Unable to load users.
                </td>
            </tr>`;

    }

}


/* DASHBOARD */

function loadDashboard() {

    getProducts();

    getUsers();

}


/* LOGOUT */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "../login.html";

        }
    );

}


/* MOBILE SIDEBAR */

const menuBtn =
    document.getElementById(
        "menuBtn"
    );

const sidebar =
    document.querySelector(
        ".sidebar"
    );


if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "show"
            );

        }
    );

}


/* INITIAL LOAD */

loadDashboard();