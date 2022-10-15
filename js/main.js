const elForm = document.querySelector(".productForm");
const elFilterForm = document.querySelector(".productFilter");

const elTemplate = document.querySelector(".cardTemplate");
const elResultList = document.querySelector(".resultList");

const elFormTitle = document.querySelector(".formTitle");
const elFormBtn = document.querySelector(".formBtn");

const elFormManufacturers = document.querySelector(".manufacturerList");
const elFilterManufacturers = document.querySelector(".filterManufacturers");
const elAddBtn = document.querySelector(".addBtn");

const elCounter = document.querySelector(".counter");

const resultStatus = document.querySelector(".productsList");
const elWrapper = document.querySelector(".wrapper");
const elCardsList = document.querySelector(".cardsList");

const API_URL_Students = "http://167.235.158.238/products";
const API_URL_Manufacturers = "http://167.235.158.238/manufacturers";

let products = [];
let manufacturers = [];

fetch(API_URL_Manufacturers)
  .then((res) => {
    if (res.status === 200) {
      return res.json();
    }
    return Promise.reject(res);
  })
  .then((manufacturersArr) => {
    manufacturers = manufacturersArr;
    addManufacturersTo();
  })
  .catch((err) => {
    console.log(err);

    if (err.status === 404) {
      showError(elCardsList, "Internet Problem");
    }
  });

const spinner = document.createElement("div");
spinner.className = "spinner-border";
spinner.role = "status";

elWrapper.prepend(spinner);

resultStatus.textContent = "Loading...";

fetch(API_URL_Students)
  .then((res) => {
    if (res.status === 200) {
      console.log(res.status);
      return res.json();
    }
    return Promise.reject(res);
  })
  .then((data) => {
    if (data) {
      products = data;
      console.log(products);
      renderProducts(products);
    }
  })
  .catch((err) => {
    console.log(err);
    if (err.status === 404) {
      showError(elWrapper, "Nothing Found !");
    }
    showError(elWrapper);
  })
  .finally(() => {
    spinner.remove();
    resultStatus.textContent = "Products list";
  });

const showError = (appendTo, errMsg) => {
  const elAlert = document.createElement("p");
  elAlert.className = "alert alert-danger";
  elAlert.textContent = errMsg || "Error";
  appendTo.append(elAlert);
};

elResultList.addEventListener("click", (evt) => {
  const target = evt.target;

  if (target.matches(".deleteBtn")) {
    const deletingId = +target.dataset.id;
    fetch(`${API_URL_Students}/${deletingId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
        return Promise.reject(res);
      })
      .then(() => {
        const deletingIndex = products.findIndex(
          (phone) => phone.id === deletingId
        );
        products.splice(deletingIndex, 1);
        renderProducts();
      });
  }
  if (target.matches(".editBtn")) {
    const editingId = +target.dataset.id;
    const editingObj = products.find((phone) => phone.id === editingId);
    editingObj.benefits = editingObj.benefits.join(" ");

    setFormValues(editingObj, "Edit products");
    elForm.dataset.editingId = editingId;
  }
});

elAddBtn.addEventListener("click", (evt) => {
  setFormValues({}, "Add products");
  elForm.dataset.editingId = "";
});

elForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const { editingId } = elForm.dataset;

  const {
    title: { value: TitleValue },
    price: { value: PriceValue },
    model: { value: ModelValue },
    benefits: { value: benefitsValue },
  } = elForm.elements;

  const newPhone = {
    id: Math.floor(Math.random() * 1000),
    title: TitleValue.trim(),
    img: "https://picsum.photos/300/200",
    price: +PriceValue,
    model: ModelValue,
    addedDate: new Date("2021-11-12").toISOString(),
    benefits: benefitsValue.split(" "),
  };

  if (TitleValue.length && +PriceValue && ModelValue != 0 && benefitsValue) {
    if (!editingId) {
      fetch(API_URL_Students, {
        method: "POST",
        body: JSON.stringify(newPhone),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.status === 201) {
            return res.json();
          }
        })
        .then((data) => {
          products.push(data);
          renderProducts();
          elModal.hide();
        })
        .catch(() => {
          const elModalBody = document.querySelector(".modalBody");

          showError(elModalBody, "Can't add the product");
        });
    } else {
      const editingIdNum = +editingId;
      fetch(`${API_URL_Students}/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(newPhone),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          }
          return Promise.reject(res);
        })
        .then(() => {
          const editingIndex = products.findIndex(
            (phone) => phone.id === editingIdNum
          );

          products.splice(editingIndex, 1, newPhone);
          renderProducts();
        });
    }
  }
});

elFilterForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const {
    search: { value: searchValue },
    // features: { value: featuresValue },
    from: { value: fromValue },
    to: { value: toValue },
    manufacturer: { value: manufacturerValue },
    sortby: { value: sortbyValue },
  } = elFilterForm.elements;

  const filteredProducts = products.filter((phone) => {
    return (
      phone.title.toLowerCase().includes(searchValue.trim().toLowerCase()) &&
      // phone.benefits
      //   .toLowerCase()
      //   .includes(featuresValue.trim().toLowerCase()) &&
      phone.price >= +fromValue &&
      (+toValue ? phone.price <= +toValue : true) &&
      (manufacturerValue == 0 ? true : phone.model.includes(manufacturerValue))
    );
  });

  filteredProducts.sort((a, b) => {
    switch (+sortbyValue) {
      case 1:
        if (a.title > b.title) {
          return 1;
        } else if (b.title > a.title) {
          return -1;
        }
        return 0;

      case 2:
        return a.price - b.price;

      case 3:
        return b.price - a.price;

      default:
        return 0;
    }
  });

  renderProducts(filteredProducts);
});

//
//
//
//
//
//
//

const elLoader = document.createElement("p");
elLoader.textContent = "Loading...";

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
function renderProducts(arr = products) {
  elResultList.innerHTML = null;

  arr.forEach((phone) => {
    const templateClone = elTemplate.cloneNode(true).content;

    const { id, title, img, price, model, addedDate, benefits } = phone;

    const elPhoneImg = templateClone.querySelector(".phoneImg");
    elPhoneImg.src = img;

    const elPhoneTitle = templateClone.querySelector(".phoneTitle");
    elPhoneTitle.textContent = title;

    const phonePrice = price;
    const elPhoneSalePrice = templateClone.querySelector(".phonePrice");
    elPhoneSalePrice.textContent = phonePrice;

    const elPhoneOrgPrice = templateClone.querySelector(".phoneSalePrice");
    elPhoneOrgPrice.textContent = Math.floor(+phonePrice + phonePrice * 0.3);

    const elPhoneModel = templateClone.querySelector(".phoreModel");
    elPhoneModel.textContent = model;

    const elPhoneDate = templateClone.querySelector(".phoneDate");
    elPhoneDate.textContent = addedDate;

    const elPhoneBeneFits = templateClone.querySelector(".phoneBenefits");

    benefits.forEach((benefit) => {
      const elBenefit = document.createElement("li");
      elBenefit.className = "badge bg-primary me-1 mb-1";
      elBenefit.textContent = benefit;
      elPhoneBeneFits.append(elBenefit);
    });

    const elEditBtn = templateClone.querySelector(".editBtn");
    elEditBtn.dataset.id = id;

    const elDeleteBtn = templateClone.querySelector(".deleteBtn");
    elDeleteBtn.dataset.id = id;

    elResultList.append(templateClone);
  });
}
function setFormValues({ title, price, model, benefits }, formType) {
  const {
    title: elTitle,
    price: elPrice,
    model: elModel,
    benefits: elBenefits,
  } = elForm.elements;

  elTitle.value = title || "";
  elPrice.value = price || "";
  elModel.value = model || 0;
  elBenefits.value = benefits || "";

  elFormTitle.textContent = formType;
  elFormBtn.textContent = formType;
}

function addManufacturersTo() {
  manufacturers.forEach((manufacturer) => {
    const elManufacturer = document.createElement("option");
    elManufacturer.textContent = manufacturer.name;
    elManufacturer.value = manufacturer.name;

    elFormManufacturers.append(elManufacturer);

    const elManufacturer2 = document.createElement("option");
    elManufacturer2.textContent = manufacturer.name;
    elManufacturer2.value = manufacturer.name;

    elFilterManufacturers.append(elManufacturer2);
  });
}

function counter(arr = products) {
  elCounter.textContent = `Count: ${arr.length}`;
}
