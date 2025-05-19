// 전역으로 products 할당
window.products = [
    {
        name: "프리미엄 기계식 키보드",
        basePrice: 189000,
        category: "keyboard",
        options: [
            { name: "청축", weight: 1.2, price: 158000 },
            { name: "갈축", weight: 1.2, price: 158000 },
            { name: "적축", weight: 1.2, price: 158000 },
            { name: "흑축", weight: 1.2, price: 168000 }
        ],
        imageUrl: "/static/images/products/keyboard1.jpg",
        extraImages: [
            "/static/images/products/keyboard2.jpg",
            "/static/images/products/keyboard3.jpg"
        ],
        description: "PBT 키캡과 알루미늄 바디로 제작된 프리미엄 기계식 키보드입니다."
    },
    {
        name: "무선 게이밍 마우스",
        basePrice: 108000,
        category: "mouse",
        options: [
            { name: "블랙", weight: 0.3, price: 89000 },
            { name: "화이트", weight: 0.3, price: 89000 }
        ],
        imageUrl: "/static/images/products/mouse1.jpg",
        extraImages: [
            "/static/images/products/mouse2.jpg",
            "/static/images/products/mouse3.jpg"
        ],
        description: "최신 센서와 무선 기술이 적용된 게이밍 마우스입니다."
    },
    {
        name: "4K 모니터",
        basePrice: 699000,
        category: "monitor",
        options: [
            { name: "27인치", weight: 5.5, price: 699000 },
            { name: "32인치", weight: 7.0, price: 899000 }
        ],
        imageUrl: "/static/images/products/monitor1.jpg",
        extraImages: [
            "/static/images/products/monitor2.jpg",
            "/static/images/products/monitor3.jpg"
        ],
        description: "선명한 화질과 넓은 시야각을 제공하는 4K 해상도 모니터입니다."
    },
    {
        name: "커브드 게이밍 모니터",
        basePrice: 550000,
        category: "monitor",
        options: [
            { name: "24인치", weight: 4.5, price: 450000 },
            { name: "27인치", weight: 5.5, price: 550000 },
            { name: "32인치", weight: 6.5, price: 650000 }
        ],
        imageUrl: "/static/images/products/curvedmonitor1.jpg",
        extraImages: [
            "/static/images/products/curvedmonitor2.jpg",
            "/static/images/products/curvedmonitor3.jpg"
        ],
        description: "165Hz 주사율과 1ms 응답속도를 지원하는 커브드 게이밍 모니터입니다."
    },
    {
        name: "레이싱 게이밍 체어",
        basePrice: 229000,
        category: "furniture",
        options: [
            { name: "블랙/레드", weight: 20, price: 189000 },
            { name: "화이트/블루", weight: 20, price: 189000 },
            { name: "블랙/그린", weight: 20, price: 189000 }
        ],
        imageUrl: "/static/images/products/chair1.jpg",
        extraImages: [
            "/static/images/products/chair2.jpg",
            "/static/images/products/chair3.jpg"
        ],
        description: "인체공학적 설계와 통기성 좋은 메쉬 소재를 사용한 프리미엄 게이밍 체어입니다."
    },
    {
        name: "RGB 게이밍 헤드셋",
        basePrice: 159000,
        category: "audio",
        options: [
            { name: "7.1채널", weight: 0.8, price: 129000 },
            { name: "스테레오", weight: 0.7, price: 99000 }
        ],
        imageUrl: "/static/images/products/headset1.jpg",
        extraImages: [
            "/static/images/products/headset2.jpg",
            "/static/images/products/headset3.jpg"
        ],
        description: "고품질 사운드와 편안한 착용감을 제공하는 RGB 게이밍 헤드셋입니다."
    },
    {
        name: "4K 빔프로젝터",
        basePrice: 1490000,
        category: "display",
        options: [
            { name: "HD", weight: 3.5, price: 590000 },
            { name: "Full HD", weight: 3.8, price: 890000 },
            { name: "4K", weight: 4.2, price: 1290000 }
        ],
        imageUrl: "/static/images/products/projector1.jpg",
        extraImages: [
            "/static/images/products/projector2.jpg",
            "/static/images/products/projector3.jpg"
        ],
        description: "최대 300인치 투사가 가능한 고성능 4K 빔프로젝터입니다."
    },
    {
        name: "게이밍 노트북",
        basePrice: 2490000,
        category: "laptop",
        options: [
            { name: "RTX 3060", weight: 2.3, price: 1890000 },
            { name: "RTX 3070", weight: 2.4, price: 2290000 },
            { name: "RTX 3080", weight: 2.5, price: 2890000 }
        ],
        imageUrl: "/static/images/products/laptop1.jpg",
        extraImages: [
            "/static/images/products/laptop2.jpg",
            "/static/images/products/laptop3.jpg"
        ],
        description: "최신 RTX 그래픽카드와 고성능 프로세서를 탑재한 게이밍 노트북입니다."
    },
    {
        name: "외장 SSD",
        basePrice: 299000,
        category: "storage",
        options: [
            { name: "500GB", weight: 0.2, price: 89000 },
            { name: "1TB", weight: 0.2, price: 159000 },
            { name: "2TB", weight: 0.2, price: 299000 }
        ],
        imageUrl: "/static/images/products/ssd1.jpg",
        extraImages: [
            "/static/images/products/ssd2.jpg",
            "/static/images/products/ssd3.jpg"
        ],
        description: "초고속 데이터 전송이 가능한 휴대용 외장 SSD입니다."
    },
    {
        name: "4K 웹캠",
        basePrice: 199000,
        category: "camera",
        options: [
            { name: "HD", weight: 0.2, price: 49000 },
            { name: "Full HD", weight: 0.25, price: 89000 },
            { name: "4K", weight: 0.3, price: 199000 }
        ],
        imageUrl: "/static/images/products/webcam1.jpg",
        extraImages: [
            "/static/images/products/webcam2.jpg",
            "/static/images/products/webcam3.jpg"
        ],
        description: "선명한 화질과 자동 포커스 기능을 갖춘 고성능 웹캠입니다."
    },
    {
        name: "RGB 게이밍 마우스패드",
        basePrice: 39000,
        category: "accessories",
        options: [
            { name: "일반형", weight: 0.3, price: 19000 },
            { name: "확장형", weight: 0.5, price: 29000 },
            { name: "RGB", weight: 0.6, price: 39000 }
        ],
        imageUrl: "/static/images/products/mousepad1.jpg",
        extraImages: [
            "/static/images/products/mousepad2.jpg",
            "/static/images/products/mousepad3.jpg"
        ],
        description: "부드러운 표면과 RGB 조명을 갖춘 프리미엄 게이밍 마우스패드입니다."
    },
    {
        name: "게이밍 스피커",
        basePrice: 158000,
        category: "audio",
        options: [
            { name: "2.0채널", weight: 2, price: 128000 },
            { name: "2.1채널", weight: 4, price: 158000 },
            { name: "5.1채널", weight: 8, price: 258000 }
        ],
        imageUrl: "/static/images/products/speaker1.jpg",
        extraImages: [
            "/static/images/products/speaker2.jpg",
            "/static/images/products/speaker3.jpg"
        ],
        description: "강력한 베이스와 선명한 사운드를 제공하는 게이밍 스피커 시스템입니다."
    },
    {
        name: "스트리밍 마이크",
        basePrice: 189000,
        category: "audio",
        options: [
            { name: "USB", weight: 0.8, price: 149000 },
            { name: "XLR", weight: 1, price: 189000 },
            { name: "RGB", weight: 1.2, price: 219000 }
        ],
        imageUrl: "/static/images/products/microphone1.jpg",
        extraImages: [
            "/static/images/products/microphone2.jpg",
            "/static/images/products/microphone3.jpg"
        ],
        description: "고품질 사운드와 편안한 착용감을 제공하는 RGB 게이밍 헤드셋입니다."
    }
];

// 초기화 함수 호출
if (typeof initializeProducts === 'function') {
    initializeProducts(window.products);
}
