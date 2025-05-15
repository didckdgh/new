const params = new URLSearchParams(window.location.search);
const productName = params.get("name");

const product = window.products.find(p => p.name === productName);

if (product) {
    // 상품명과 설명 업데이트
    document.getElementById("product-name").innerText = product.name;
    document.getElementById("product-description").innerText = product.description;
    
    // 카테고리 업데이트
    document.getElementById("category-name").innerText = product.category;

    // 이미지 슬라이더 렌더링
    const imageSlider = document.getElementById("image-slider");
    const thumbnailList = document.getElementById("thumbnail-list");
    const allImages = [product.imageUrl, ...(product.extraImages || [])];
    
    // 메인 이미지
    const mainImg = document.createElement("img");
    mainImg.src = allImages[0];
    mainImg.alt = product.name;
    imageSlider.appendChild(mainImg);

    // 썸네일 이미지들
    allImages.forEach((url, index) => {
        const thumb = document.createElement("img");
        thumb.src = url;
        thumb.alt = `${product.name} 이미지 ${index + 1}`;
        thumb.onclick = () => {
            mainImg.src = url;
        };
        thumbnailList.appendChild(thumb);
    });

    // 옵션 선택 박스
    const optionSelect = document.getElementById("option-select");
    product.options.forEach((opt, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.text = `${opt.name} - ${opt.price.toLocaleString()}원`;
        optionSelect.appendChild(option);
    });

    // 가격 정보 업데이트
    updatePriceInfo();
}

// 가격 정보 업데이트 함수
function updatePriceInfo() {
    if (!product) return;
    
    const selectedIndex = document.getElementById("option-select").value;
    const selectedOption = product.options[selectedIndex];
    const quantity = parseInt(document.getElementById("quantity").value, 10) || 1;
    
    // UI 업데이트
    document.getElementById("total-price").innerText = `${selectedOption.price.toLocaleString()}원`;
    
    // 총 금액 계산
    const total = selectedOption.price * quantity;
    document.getElementById("final-total-price").innerText = total.toLocaleString();
}

// 가격 업데이트 이벤트 핸들러
window.updatePrice = function() {
    updatePriceInfo();
};

// 장바구니 추가 함수
window.addToCart = function() {
    if (!product) return;

    const selectedIndex = document.getElementById("option-select").value;
    const quantity = parseInt(document.getElementById("quantity").value, 10) || 1;
    const selectedOption = product.options[selectedIndex];

    // 장바구니 데이터 구성
    const cartItem = {
        productId: product.name, // 상품 식별자
        name: product.name,
        option: selectedOption.name,
        optionPrice: selectedOption.price,
        quantity: quantity,
        totalPrice: selectedOption.price * quantity,
        imageUrl: product.imageUrl
    };

    // 로컬 스토리지에서 장바구니 데이터 가져오기
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // 동일 상품 & 옵션이 있는지 확인
    const existingItemIndex = cart.findIndex(item => 
        item.productId === cartItem.productId && item.option === cartItem.option
    );

    if (existingItemIndex >= 0) {
        // 기존 아이템이 있으면 수량만 증가
        cart[existingItemIndex].quantity += quantity;
        cart[existingItemIndex].totalPrice = cart[existingItemIndex].quantity * cart[existingItemIndex].optionPrice;
    } else {
        // 새 아이템 추가
        cart.push(cartItem);
    }

    // 장바구니 데이터 저장
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // 알림 표시
    alert("장바구니에 추가되었습니다.");
};

// 바로 구매 함수
window.buyNow = function() {
    addToCart();
    window.location.href = "/cart";
};

// 초기 가격 정보 업데이트
document.addEventListener('DOMContentLoaded', updatePriceInfo);
