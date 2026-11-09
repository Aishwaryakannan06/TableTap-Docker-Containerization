
// =====================================
// TABLETAP - RESTAURANT ORDERING SYSTEM
// =====================================

// FOOD MENU
const menuItems = [
    { id: 1, name: "Paneer Tikka", category: "Starters", price: 180, emoji: "🍢", description: "Grilled paneer with Indian spices" },
    { id: 2, name: "Veg Spring Rolls", category: "Starters", price: 140, emoji: "🥟", description: "Crispy vegetable rolls" },
    { id: 3, name: "Veg Biryani", category: "Main Course", price: 220, emoji: "🍛", description: "Aromatic vegetable biryani" },
    { id: 4, name: "Masala Dosa", category: "Main Course", price: 100, emoji: "🥞", description: "Crispy dosa with potato masala" },
    { id: 5, name: "Fresh Lime Soda", category: "Drinks", price: 60, emoji: "🍹", description: "Refreshing lime drink" },
    { id: 6, name: "Cold Coffee", category: "Drinks", price: 110, emoji: "🥤", description: "Chilled creamy coffee" },
    { id: 7, name: "Chocolate Brownie", category: "Desserts", price: 120, emoji: "🍫", description: "Rich chocolate brownie" },
    { id: 8, name: "Vanilla Ice Cream", category: "Desserts", price: 80, emoji: "🍨", description: "Classic vanilla ice cream" }
];

let cart = [];

const menuGrid = document.getElementById("menuGrid");
const cartItems = document.getElementById("cartItems");
const totalElement = document.getElementById("total");
const message = document.getElementById("message");

// =====================================
// MENU DISPLAY
// =====================================

function displayMenu(category = "All") {
    menuGrid.innerHTML = "";

    const filteredItems = category === "All"
        ? menuItems
        : menuItems.filter(item => item.category === category);

    filteredItems.forEach(item => {
        const card = document.createElement("div");
        card.className = "food-card";

        card.innerHTML = `
            <div class="food-image">${item.emoji}</div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="food-bottom">
                <span class="price">₹${item.price}</span>
                <button class="add-button" data-id="${item.id}">
                    + Add
                </button>
            </div>
        `;

        menuGrid.appendChild(card);
    });
}

// =====================================
// CART FUNCTIONS
// =====================================

function addToCart(id) {
    const item = menuItems.find(food => food.id === id);
    const existingItem = cart.find(food => food.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    message.textContent = "";
    displayCart();
}

function changeQuantity(id, amount) {
    const item = cart.find(food => food.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(food => food.id !== id);
    }

    displayCart();
}

function getCartTotal() {
    return cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );
}

function displayCart() {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML =
            '<p class="empty">Your cart is empty.</p>';
    }

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "cart-item";

        row.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <p>₹${item.price * item.quantity}</p>
            </div>
            <div class="quantity-controls">
                <button data-id="${item.id}" data-change="-1">−</button>
                <span>${item.quantity}</span>
                <button data-id="${item.id}" data-change="1">+</button>
            </div>
        `;

        cartItems.appendChild(row);
    });

    totalElement.textContent = `₹${getCartTotal()}`;

    // Update bill splitting whenever the cart changes
    renderSplitBill();
}

// =====================================
// MENU AND CART EVENT LISTENERS
// =====================================

menuGrid.addEventListener("click", function(event) {
    const button = event.target.closest(".add-button");

    if (button) {
        addToCart(Number(button.dataset.id));
    }
});

cartItems.addEventListener("click", function(event) {
    const button = event.target.closest("button");

    if (button) {
        changeQuantity(
            Number(button.dataset.id),
            Number(button.dataset.change)
        );
    }
});

document.querySelectorAll(".category").forEach(button => {
    button.addEventListener("click", function() {
        document.querySelector(".category.active")
            ?.classList.remove("active");

        this.classList.add("active");
        displayMenu(this.dataset.category);
    });
});

// =====================================
// PLACE ORDER - FLASK CONNECTION
// =====================================

document.getElementById("orderButton").addEventListener("click", async function() {
    if (cart.length === 0) {
        message.textContent = "Please add food to your cart!";
        return;
    }

    const button = this;
    button.disabled = true;
    button.textContent = "Sending...";
    message.textContent = "";

    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                items: cart.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                }))
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Order failed");
        }

        message.textContent =
            `Order #${result.order_id} placed successfully! Total: ₹${result.total}`;

        cart = [];
        displayCart();

    } catch (error) {
        message.textContent = error.message;
    } finally {
        button.disabled = false;
        button.textContent = "Place Order";
    }
});

// =====================================
// SPLIT BILL SYSTEM
// =====================================

function renderSplitBill() {
    const methodElement = document.getElementById("splitMethod");
    const content = document.getElementById("splitContent");
    const totalDisplay = document.getElementById("splitTotal");

    if (!methodElement || !content || !totalDisplay) return;

    const method = methodElement.value;
    const total = getCartTotal();

    totalDisplay.textContent = `₹${total.toFixed(2)}`;

    if (total === 0) {
        content.innerHTML =
            '<p class="empty">Add food to your cart to split the bill.</p>';
        return;
    }

    // EQUAL SPLIT
    if (method === "equal") {
        content.innerHTML = `
            <label for="peopleCount">Number of people</label>
            <input type="number" id="peopleCount"
                min="1" max="50" value="2">
            <div id="equalResult" class="split-result"></div>
        `;

        const peopleInput = document.getElementById("peopleCount");

        function calculateEqual() {
            const people = Number(peopleInput.value);
            const result = document.getElementById("equalResult");

            if (!Number.isInteger(people) || people < 1 || people > 50) {
                result.textContent = "Enter a number between 1 and 50.";
                return;
            }

            const totalPaise = Math.round(total * 100);
            const baseShare = Math.floor(totalPaise / people);
            const remainder = totalPaise % people;

            result.innerHTML = "";

            for (let i = 1; i <= people; i++) {
                const share = (baseShare + (i <= remainder ? 1 : 0)) / 100;

                result.innerHTML += `
                    <div class="split-person">
                        <span>Person ${i}</span>
                        <strong>₹${share.toFixed(2)}</strong>
                    </div>
                `;
            }
        }

        peopleInput.addEventListener("input", calculateEqual);
        calculateEqual();
    }

    // SPLIT BY ITEMS
    else if (method === "items") {
        content.innerHTML = `
            <label for="itemPeople">Number of people</label>
            <input type="number" id="itemPeople"
                min="1" max="50" value="2">
            <div id="itemAssignments"></div>
            <div id="itemResult" class="split-result"></div>
        `;

        const peopleInput = document.getElementById("itemPeople");
        const assignments = document.getElementById("itemAssignments");
        const result = document.getElementById("itemResult");

        function calculateItems() {
            const people = Number(peopleInput.value);

            if (!Number.isInteger(people) || people < 1 || people > 50) {
                assignments.innerHTML = "";
                result.textContent = "Enter a number between 1 and 50.";
                return;
            }

            assignments.innerHTML = cart.map((item, index) => `
                <div class="split-person">
                    <span>${item.name} × ${item.quantity}<br>
                    ₹${(item.price * item.quantity).toFixed(2)}</span>

                    <select data-item-index="${index}">
                        ${Array.from({ length: people }, (_, i) =>
                            `<option value="${i + 1}">Person ${i + 1}</option>`
                        ).join("")}
                    </select>
                </div>
            `).join("");

            function updateShares() {
                const shares = Array(people).fill(0);

                assignments.querySelectorAll("select").forEach(select => {
                    const index = Number(select.dataset.itemIndex);
                    const person = Number(select.value) - 1;

                    shares[person] +=
                        cart[index].price * cart[index].quantity;
                });

                result.innerHTML = shares.map((share, i) => `
                    <div class="split-person">
                        <span>Person ${i + 1}</span>
                        <strong>₹${share.toFixed(2)}</strong>
                    </div>
                `).join("");
            }

            assignments.querySelectorAll("select").forEach(select => {
                select.addEventListener("change", updateShares);
            });

            updateShares();
        }

        peopleInput.addEventListener("input", calculateItems);
        calculateItems();
    }

    // CUSTOM SPLIT
    else if (method === "custom") {
        content.innerHTML = `
            <label for="customPeople">Number of people</label>
            <input type="number" id="customPeople"
                min="1" max="50" value="2">
            <div id="customInputs"></div>
            <div id="customResult" class="split-result"></div>
        `;

        const peopleInput = document.getElementById("customPeople");
        const inputs = document.getElementById("customInputs");
        const result = document.getElementById("customResult");

        function checkCustomTotal() {
            const fields = [...inputs.querySelectorAll("input")];

            const valid = fields.every(input =>
                input.value.trim() !== "" &&
                Number.isFinite(Number(input.value)) &&
                Number(input.value) >= 0
            );

            if (!valid) {
                result.innerHTML =
                    '<p class="split-error">Enter valid amounts.</p>';
                return;
            }

            const enteredPaise = fields.reduce(
                (sum, input) => sum + Math.round(Number(input.value) * 100),
                0
            );

            const difference = Math.round(total * 100) - enteredPaise;

            if (difference === 0) {
                result.innerHTML =
                    '<p class="split-success">Perfect! All shares match the bill.</p>';
            } else {
                result.innerHTML = `
                    <p class="split-error">
                        Entered: ₹${(enteredPaise / 100).toFixed(2)}<br>
                        Bill: ₹${total.toFixed(2)}<br>
                        Difference: ₹${(difference / 100).toFixed(2)}
                    </p>
                `;
            }
        }

        function createCustomInputs() {
            const people = Number(peopleInput.value);

            if (!Number.isInteger(people) || people < 1 || people > 50) {
                inputs.innerHTML = "";
                result.textContent = "Enter a number between 1 and 50.";
                return;
            }

            inputs.innerHTML = Array.from({ length: people }, (_, i) => `
                <label>Person ${i + 1} share (₹)</label>
                <input type="number" min="0" step="0.01"
                    class="custom-share" value="0">
            `).join("");

            inputs.querySelectorAll("input").forEach(input => {
                input.addEventListener("input", checkCustomTotal);
            });

            checkCustomTotal();
        }

        peopleInput.addEventListener("input", createCustomInputs);
        createCustomInputs();
    }
}

// SPLIT METHOD SELECTION
document.getElementById("splitMethod").addEventListener(
    "change", renderSplitBill
);

// =====================================
// START APPLICATION
// =====================================

displayMenu();
displayCart();
