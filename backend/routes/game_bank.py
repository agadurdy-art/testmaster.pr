"""
Game Bank API - Multi-Language Support
======================================
Mini-games for vocabulary, listening, and speaking practice.
Fully supports EN/VI/TR language modes with strict purity.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import random

router = APIRouter(prefix="/api/games", tags=["Game Bank"])


# ============ GAME DATA MODELS ============

class GameQuestion(BaseModel):
    id: str
    type: str
    question: str
    options: Optional[List[str]] = None
    correct_answer: str
    hint: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None


class GameConfig(BaseModel):
    game_id: str
    game_type: str
    title: str
    description: str
    difficulty: str
    time_limit: Optional[int] = None
    questions: List[Dict[str, Any]]


# ============ MULTI-LANGUAGE VOCABULARY DATA ============
# Format: word/meaning/example all have {en, vi, tr} keys

VOCABULARY_DATA = {
    "family": {
        "title": {"en": "Family", "vi": "Gia đình", "tr": "Aile"},
        "items": [
            {
                "word": {"en": "mother", "vi": "mẹ", "tr": "anne"},
                "meaning": {"en": "female parent", "vi": "người sinh ra mình (nữ)", "tr": "anne, doğuran kadın"},
                "image": "👩",
                "example": {"en": "My mother is kind.", "vi": "Mẹ tôi rất tốt bụng.", "tr": "Annem çok iyi."}
            },
            {
                "word": {"en": "father", "vi": "bố/cha", "tr": "baba"},
                "meaning": {"en": "male parent", "vi": "người sinh ra mình (nam)", "tr": "baba, erkek ebeveyn"},
                "image": "👨",
                "example": {"en": "My father works hard.", "vi": "Bố tôi làm việc chăm chỉ.", "tr": "Babam çok çalışkan."}
            },
            {
                "word": {"en": "sister", "vi": "chị/em gái", "tr": "kız kardeş"},
                "meaning": {"en": "female sibling", "vi": "chị hoặc em gái", "tr": "kız kardeş"},
                "image": "👧",
                "example": {"en": "I have one sister.", "vi": "Tôi có một chị gái.", "tr": "Bir kız kardeşim var."}
            },
            {
                "word": {"en": "brother", "vi": "anh/em trai", "tr": "erkek kardeş"},
                "meaning": {"en": "male sibling", "vi": "anh hoặc em trai", "tr": "erkek kardeş"},
                "image": "👦",
                "example": {"en": "My brother is tall.", "vi": "Anh trai tôi cao.", "tr": "Erkek kardeşim uzun boylu."}
            },
            {
                "word": {"en": "grandmother", "vi": "bà", "tr": "büyükanne"},
                "meaning": {"en": "mother's or father's mother", "vi": "mẹ của bố hoặc mẹ", "tr": "annenin veya babanın annesi"},
                "image": "👵",
                "example": {"en": "Grandmother bakes cookies.", "vi": "Bà làm bánh quy.", "tr": "Büyükannem kurabiye yapar."}
            },
            {
                "word": {"en": "grandfather", "vi": "ông", "tr": "büyükbaba"},
                "meaning": {"en": "mother's or father's father", "vi": "bố của bố hoặc mẹ", "tr": "annenin veya babanın babası"},
                "image": "👴",
                "example": {"en": "Grandfather tells stories.", "vi": "Ông kể chuyện.", "tr": "Büyükbabam hikaye anlatır."}
            },
            {
                "word": {"en": "aunt", "vi": "cô/dì", "tr": "teyze/hala"},
                "meaning": {"en": "parent's sister", "vi": "chị/em gái của bố hoặc mẹ", "tr": "anne veya babanın kız kardeşi"},
                "image": "👩",
                "example": {"en": "My aunt lives nearby.", "vi": "Cô tôi sống gần đây.", "tr": "Teyzem yakında oturuyor."}
            },
            {
                "word": {"en": "uncle", "vi": "chú/bác", "tr": "amca/dayı"},
                "meaning": {"en": "parent's brother", "vi": "anh/em trai của bố hoặc mẹ", "tr": "anne veya babanın erkek kardeşi"},
                "image": "👨",
                "example": {"en": "Uncle visits on weekends.", "vi": "Chú đến thăm vào cuối tuần.", "tr": "Amcam hafta sonları ziyarete gelir."}
            },
        ]
    },
    "food": {
        "title": {"en": "Food", "vi": "Thức ăn", "tr": "Yiyecek"},
        "items": [
            {
                "word": {"en": "apple", "vi": "táo", "tr": "elma"},
                "meaning": {"en": "red or green fruit", "vi": "quả màu đỏ hoặc xanh", "tr": "kırmızı veya yeşil meyve"},
                "image": "🍎",
                "example": {"en": "I eat an apple every day.", "vi": "Tôi ăn một quả táo mỗi ngày.", "tr": "Her gün bir elma yerim."}
            },
            {
                "word": {"en": "banana", "vi": "chuối", "tr": "muz"},
                "meaning": {"en": "yellow curved fruit", "vi": "quả dài màu vàng", "tr": "sarı uzun meyve"},
                "image": "🍌",
                "example": {"en": "Bananas are yellow.", "vi": "Chuối có màu vàng.", "tr": "Muzlar sarıdır."}
            },
            {
                "word": {"en": "bread", "vi": "bánh mì", "tr": "ekmek"},
                "meaning": {"en": "baked food from flour", "vi": "thực phẩm làm từ bột mì", "tr": "undan yapılan yiyecek"},
                "image": "🍞",
                "example": {"en": "I need bread for breakfast.", "vi": "Tôi cần bánh mì cho bữa sáng.", "tr": "Kahvaltı için ekmeğe ihtiyacım var."}
            },
            {
                "word": {"en": "cheese", "vi": "phô mai", "tr": "peynir"},
                "meaning": {"en": "dairy product", "vi": "sản phẩm từ sữa", "tr": "süt ürünü"},
                "image": "🧀",
                "example": {"en": "Cheese is delicious.", "vi": "Phô mai rất ngon.", "tr": "Peynir lezzetlidir."}
            },
            {
                "word": {"en": "chicken", "vi": "gà", "tr": "tavuk"},
                "meaning": {"en": "poultry meat", "vi": "thịt gia cầm", "tr": "kümes hayvanı eti"},
                "image": "🍗",
                "example": {"en": "We had chicken for dinner.", "vi": "Chúng tôi ăn gà cho bữa tối.", "tr": "Akşam yemeğinde tavuk yedik."}
            },
            {
                "word": {"en": "orange", "vi": "cam", "tr": "portakal"},
                "meaning": {"en": "citrus fruit", "vi": "quả họ cam quýt", "tr": "narenciye meyvesi"},
                "image": "🍊",
                "example": {"en": "Orange juice is healthy.", "vi": "Nước cam rất tốt cho sức khỏe.", "tr": "Portakal suyu sağlıklıdır."}
            },
            {
                "word": {"en": "rice", "vi": "cơm/gạo", "tr": "pirinç"},
                "meaning": {"en": "grain food", "vi": "lương thực từ lúa", "tr": "tahıl yiyeceği"},
                "image": "🍚",
                "example": {"en": "Rice is a staple food.", "vi": "Cơm là thực phẩm chính.", "tr": "Pirinç temel bir gıdadır."}
            },
            {
                "word": {"en": "water", "vi": "nước", "tr": "su"},
                "meaning": {"en": "clear liquid for drinking", "vi": "chất lỏng trong suốt để uống", "tr": "içmek için berrak sıvı"},
                "image": "💧",
                "example": {"en": "Drink more water.", "vi": "Hãy uống nhiều nước hơn.", "tr": "Daha çok su iç."}
            },
        ]
    },
    "animals": {
        "title": {"en": "Animals", "vi": "Động vật", "tr": "Hayvanlar"},
        "items": [
            {
                "word": {"en": "cat", "vi": "mèo", "tr": "kedi"},
                "meaning": {"en": "small pet animal", "vi": "động vật nuôi nhỏ", "tr": "küçük evcil hayvan"},
                "image": "🐱",
                "example": {"en": "The cat is sleeping.", "vi": "Con mèo đang ngủ.", "tr": "Kedi uyuyor."}
            },
            {
                "word": {"en": "dog", "vi": "chó", "tr": "köpek"},
                "meaning": {"en": "loyal pet animal", "vi": "động vật nuôi trung thành", "tr": "sadık evcil hayvan"},
                "image": "🐕",
                "example": {"en": "My dog is friendly.", "vi": "Con chó của tôi rất thân thiện.", "tr": "Köpeğim cana yakın."}
            },
            {
                "word": {"en": "bird", "vi": "chim", "tr": "kuş"},
                "meaning": {"en": "flying animal", "vi": "động vật bay", "tr": "uçan hayvan"},
                "image": "🐦",
                "example": {"en": "Birds can fly.", "vi": "Chim có thể bay.", "tr": "Kuşlar uçabilir."}
            },
            {
                "word": {"en": "fish", "vi": "cá", "tr": "balık"},
                "meaning": {"en": "water animal", "vi": "động vật sống dưới nước", "tr": "suda yaşayan hayvan"},
                "image": "🐟",
                "example": {"en": "Fish live in water.", "vi": "Cá sống dưới nước.", "tr": "Balıklar suda yaşar."}
            },
            {
                "word": {"en": "rabbit", "vi": "thỏ", "tr": "tavşan"},
                "meaning": {"en": "small hopping animal", "vi": "động vật nhỏ nhảy", "tr": "küçük zıplayan hayvan"},
                "image": "🐰",
                "example": {"en": "Rabbits hop fast.", "vi": "Thỏ nhảy nhanh.", "tr": "Tavşanlar hızlı zıplar."}
            },
            {
                "word": {"en": "elephant", "vi": "voi", "tr": "fil"},
                "meaning": {"en": "large gray animal", "vi": "động vật lớn màu xám", "tr": "büyük gri hayvan"},
                "image": "🐘",
                "example": {"en": "Elephants are big.", "vi": "Voi rất to.", "tr": "Filler büyüktür."}
            },
            {
                "word": {"en": "lion", "vi": "sư tử", "tr": "aslan"},
                "meaning": {"en": "king of animals", "vi": "vua của các loài động vật", "tr": "hayvanların kralı"},
                "image": "🦁",
                "example": {"en": "The lion is king.", "vi": "Sư tử là vua.", "tr": "Aslan kraldır."}
            },
            {
                "word": {"en": "monkey", "vi": "khỉ", "tr": "maymun"},
                "meaning": {"en": "climbing animal", "vi": "động vật leo trèo", "tr": "tırmanan hayvan"},
                "image": "🐵",
                "example": {"en": "Monkeys like bananas.", "vi": "Khỉ thích chuối.", "tr": "Maymunlar muz sever."}
            },
        ]
    },
    "colors": {
        "title": {"en": "Colors", "vi": "Màu sắc", "tr": "Renkler"},
        "items": [
            {
                "word": {"en": "red", "vi": "đỏ", "tr": "kırmızı"},
                "meaning": {"en": "color of blood", "vi": "màu của máu", "tr": "kanın rengi"},
                "image": "🔴",
                "example": {"en": "Apples are red.", "vi": "Táo có màu đỏ.", "tr": "Elmalar kırmızıdır."}
            },
            {
                "word": {"en": "blue", "vi": "xanh dương", "tr": "mavi"},
                "meaning": {"en": "color of sky", "vi": "màu của bầu trời", "tr": "gökyüzünün rengi"},
                "image": "🔵",
                "example": {"en": "The sky is blue.", "vi": "Bầu trời màu xanh.", "tr": "Gökyüzü mavidir."}
            },
            {
                "word": {"en": "green", "vi": "xanh lá", "tr": "yeşil"},
                "meaning": {"en": "color of grass", "vi": "màu của cỏ", "tr": "çimin rengi"},
                "image": "🟢",
                "example": {"en": "Grass is green.", "vi": "Cỏ có màu xanh.", "tr": "Çimen yeşildir."}
            },
            {
                "word": {"en": "yellow", "vi": "vàng", "tr": "sarı"},
                "meaning": {"en": "color of sun", "vi": "màu của mặt trời", "tr": "güneşin rengi"},
                "image": "🟡",
                "example": {"en": "Bananas are yellow.", "vi": "Chuối có màu vàng.", "tr": "Muzlar sarıdır."}
            },
            {
                "word": {"en": "orange", "vi": "cam", "tr": "turuncu"},
                "meaning": {"en": "mix of red and yellow", "vi": "pha trộn đỏ và vàng", "tr": "kırmızı ve sarının karışımı"},
                "image": "🟠",
                "example": {"en": "Oranges are orange.", "vi": "Cam có màu cam.", "tr": "Portakallar turuncudur."}
            },
            {
                "word": {"en": "purple", "vi": "tím", "tr": "mor"},
                "meaning": {"en": "mix of red and blue", "vi": "pha trộn đỏ và xanh", "tr": "kırmızı ve mavinin karışımı"},
                "image": "🟣",
                "example": {"en": "Grapes can be purple.", "vi": "Nho có thể có màu tím.", "tr": "Üzümler mor olabilir."}
            },
            {
                "word": {"en": "black", "vi": "đen", "tr": "siyah"},
                "meaning": {"en": "darkest color", "vi": "màu tối nhất", "tr": "en koyu renk"},
                "image": "⚫",
                "example": {"en": "Night is black.", "vi": "Đêm màu đen.", "tr": "Gece siyahtır."}
            },
            {
                "word": {"en": "white", "vi": "trắng", "tr": "beyaz"},
                "meaning": {"en": "lightest color", "vi": "màu sáng nhất", "tr": "en açık renk"},
                "image": "⚪",
                "example": {"en": "Snow is white.", "vi": "Tuyết màu trắng.", "tr": "Kar beyazdır."}
            },
        ]
    },
    "numbers": {
        "title": {"en": "Numbers", "vi": "Số", "tr": "Sayılar"},
        "items": [
            {
                "word": {"en": "one", "vi": "một", "tr": "bir"},
                "meaning": {"en": "1", "vi": "1", "tr": "1"},
                "image": "1️⃣",
                "example": {"en": "I have one nose.", "vi": "Tôi có một cái mũi.", "tr": "Bir burnum var."}
            },
            {
                "word": {"en": "two", "vi": "hai", "tr": "iki"},
                "meaning": {"en": "2", "vi": "2", "tr": "2"},
                "image": "2️⃣",
                "example": {"en": "I have two eyes.", "vi": "Tôi có hai mắt.", "tr": "İki gözüm var."}
            },
            {
                "word": {"en": "three", "vi": "ba", "tr": "üç"},
                "meaning": {"en": "3", "vi": "3", "tr": "3"},
                "image": "3️⃣",
                "example": {"en": "A triangle has three sides.", "vi": "Tam giác có ba cạnh.", "tr": "Üçgenin üç kenarı var."}
            },
            {
                "word": {"en": "four", "vi": "bốn", "tr": "dört"},
                "meaning": {"en": "4", "vi": "4", "tr": "4"},
                "image": "4️⃣",
                "example": {"en": "A dog has four legs.", "vi": "Chó có bốn chân.", "tr": "Köpeğin dört bacağı var."}
            },
            {
                "word": {"en": "five", "vi": "năm", "tr": "beş"},
                "meaning": {"en": "5", "vi": "5", "tr": "5"},
                "image": "5️⃣",
                "example": {"en": "I have five fingers.", "vi": "Tôi có năm ngón tay.", "tr": "Beş parmağım var."}
            },
            {
                "word": {"en": "ten", "vi": "mười", "tr": "on"},
                "meaning": {"en": "10", "vi": "10", "tr": "10"},
                "image": "🔟",
                "example": {"en": "I have ten toes.", "vi": "Tôi có mười ngón chân.", "tr": "On ayak parmağım var."}
            },
            {
                "word": {"en": "twenty", "vi": "hai mươi", "tr": "yirmi"},
                "meaning": {"en": "20", "vi": "20", "tr": "20"},
                "image": "2️⃣0️⃣",
                "example": {"en": "Twenty students in class.", "vi": "Hai mươi học sinh trong lớp.", "tr": "Sınıfta yirmi öğrenci var."}
            },
            {
                "word": {"en": "hundred", "vi": "một trăm", "tr": "yüz"},
                "meaning": {"en": "100", "vi": "100", "tr": "100"},
                "image": "💯",
                "example": {"en": "One hundred percent!", "vi": "Một trăm phần trăm!", "tr": "Yüzde yüz!"}
            },
        ]
    },
    "school": {
        "title": {"en": "School", "vi": "Trường học", "tr": "Okul"},
        "items": [
            {
                "word": {"en": "book", "vi": "sách", "tr": "kitap"},
                "meaning": {"en": "reading material", "vi": "tài liệu đọc", "tr": "okuma materyali"},
                "image": "📚",
                "example": {"en": "I read a book.", "vi": "Tôi đọc sách.", "tr": "Kitap okuyorum."}
            },
            {
                "word": {"en": "pencil", "vi": "bút chì", "tr": "kalem"},
                "meaning": {"en": "writing tool", "vi": "dụng cụ viết", "tr": "yazma aracı"},
                "image": "✏️",
                "example": {"en": "Write with a pencil.", "vi": "Viết bằng bút chì.", "tr": "Kalemle yaz."}
            },
            {
                "word": {"en": "teacher", "vi": "giáo viên", "tr": "öğretmen"},
                "meaning": {"en": "person who teaches", "vi": "người dạy học", "tr": "öğreten kişi"},
                "image": "👩‍🏫",
                "example": {"en": "The teacher is kind.", "vi": "Giáo viên rất tốt bụng.", "tr": "Öğretmen nazik."}
            },
            {
                "word": {"en": "student", "vi": "học sinh", "tr": "öğrenci"},
                "meaning": {"en": "person who learns", "vi": "người học", "tr": "öğrenen kişi"},
                "image": "👨‍🎓",
                "example": {"en": "I am a student.", "vi": "Tôi là học sinh.", "tr": "Ben bir öğrenciyim."}
            },
            {
                "word": {"en": "classroom", "vi": "lớp học", "tr": "sınıf"},
                "meaning": {"en": "room for learning", "vi": "phòng học", "tr": "öğrenme odası"},
                "image": "🏫",
                "example": {"en": "The classroom is big.", "vi": "Lớp học rất rộng.", "tr": "Sınıf büyük."}
            },
            {
                "word": {"en": "homework", "vi": "bài tập về nhà", "tr": "ödev"},
                "meaning": {"en": "work to do at home", "vi": "bài làm ở nhà", "tr": "evde yapılacak iş"},
                "image": "📝",
                "example": {"en": "Do your homework.", "vi": "Làm bài tập về nhà đi.", "tr": "Ödevini yap."}
            },
            {
                "word": {"en": "desk", "vi": "bàn học", "tr": "sıra"},
                "meaning": {"en": "table for studying", "vi": "bàn để học", "tr": "çalışma masası"},
                "image": "🪑",
                "example": {"en": "Sit at your desk.", "vi": "Ngồi vào bàn của bạn.", "tr": "Sırana otur."}
            },
            {
                "word": {"en": "board", "vi": "bảng", "tr": "tahta"},
                "meaning": {"en": "surface for writing", "vi": "bề mặt để viết", "tr": "yazı yazma yüzeyi"},
                "image": "📋",
                "example": {"en": "Look at the board.", "vi": "Nhìn lên bảng.", "tr": "Tahtaya bak."}
            },
        ]
    },
    "weather": {
        "title": {"en": "Weather", "vi": "Thời tiết", "tr": "Hava Durumu"},
        "items": [
            {
                "word": {"en": "sunny", "vi": "nắng", "tr": "güneşli"},
                "meaning": {"en": "bright with sunlight", "vi": "sáng với ánh nắng", "tr": "güneş ışığıyla parlak"},
                "image": "☀️",
                "example": {"en": "It's sunny today.", "vi": "Hôm nay trời nắng.", "tr": "Bugün güneşli."}
            },
            {
                "word": {"en": "rainy", "vi": "mưa", "tr": "yağmurlu"},
                "meaning": {"en": "with falling rain", "vi": "có mưa rơi", "tr": "yağmur yağan"},
                "image": "🌧️",
                "example": {"en": "Bring an umbrella, it's rainy.", "vi": "Mang ô đi, trời đang mưa.", "tr": "Şemsiye al, yağmurlu."}
            },
            {
                "word": {"en": "cloudy", "vi": "nhiều mây", "tr": "bulutlu"},
                "meaning": {"en": "covered with clouds", "vi": "phủ đầy mây", "tr": "bulutlarla kaplı"},
                "image": "☁️",
                "example": {"en": "The sky is cloudy.", "vi": "Trời nhiều mây.", "tr": "Gökyüzü bulutlu."}
            },
            {
                "word": {"en": "windy", "vi": "gió", "tr": "rüzgarlı"},
                "meaning": {"en": "with strong wind", "vi": "có gió mạnh", "tr": "güçlü rüzgarlı"},
                "image": "💨",
                "example": {"en": "It's too windy outside.", "vi": "Bên ngoài gió quá.", "tr": "Dışarısı çok rüzgarlı."}
            },
            {
                "word": {"en": "snowy", "vi": "tuyết", "tr": "karlı"},
                "meaning": {"en": "with falling snow", "vi": "có tuyết rơi", "tr": "kar yağan"},
                "image": "❄️",
                "example": {"en": "Winters are snowy here.", "vi": "Mùa đông ở đây có tuyết.", "tr": "Kışlar burada karlı."}
            },
            {
                "word": {"en": "hot", "vi": "nóng", "tr": "sıcak"},
                "meaning": {"en": "high temperature", "vi": "nhiệt độ cao", "tr": "yüksek sıcaklık"},
                "image": "🔥",
                "example": {"en": "Summer is very hot.", "vi": "Mùa hè rất nóng.", "tr": "Yaz çok sıcak."}
            },
            {
                "word": {"en": "cold", "vi": "lạnh", "tr": "soğuk"},
                "meaning": {"en": "low temperature", "vi": "nhiệt độ thấp", "tr": "düşük sıcaklık"},
                "image": "🥶",
                "example": {"en": "Winter is cold.", "vi": "Mùa đông lạnh.", "tr": "Kış soğuktur."}
            },
            {
                "word": {"en": "storm", "vi": "bão", "tr": "fırtına"},
                "meaning": {"en": "violent weather", "vi": "thời tiết dữ dội", "tr": "şiddetli hava"},
                "image": "⛈️",
                "example": {"en": "A storm is coming.", "vi": "Bão đang đến.", "tr": "Fırtına geliyor."}
            },
        ]
    },
    "travel": {
        "title": {"en": "Travel", "vi": "Du lịch", "tr": "Seyahat"},
        "items": [
            {
                "word": {"en": "airport", "vi": "sân bay", "tr": "havalimanı"},
                "meaning": {"en": "place for planes", "vi": "nơi máy bay đỗ", "tr": "uçakların bulunduğu yer"},
                "image": "✈️",
                "example": {"en": "We arrived at the airport.", "vi": "Chúng tôi đến sân bay.", "tr": "Havalimanına vardık."}
            },
            {
                "word": {"en": "hotel", "vi": "khách sạn", "tr": "otel"},
                "meaning": {"en": "place to stay", "vi": "nơi ở", "tr": "kalacak yer"},
                "image": "🏨",
                "example": {"en": "The hotel was comfortable.", "vi": "Khách sạn rất thoải mái.", "tr": "Otel rahattı."}
            },
            {
                "word": {"en": "passport", "vi": "hộ chiếu", "tr": "pasaport"},
                "meaning": {"en": "travel document", "vi": "giấy tờ du lịch", "tr": "seyahat belgesi"},
                "image": "🛂",
                "example": {"en": "Don't forget your passport.", "vi": "Đừng quên hộ chiếu.", "tr": "Pasaportunu unutma."}
            },
            {
                "word": {"en": "ticket", "vi": "vé", "tr": "bilet"},
                "meaning": {"en": "travel permit", "vi": "giấy phép đi lại", "tr": "seyahat izni"},
                "image": "🎫",
                "example": {"en": "I booked a ticket online.", "vi": "Tôi đặt vé trực tuyến.", "tr": "Online bilet aldım."}
            },
            {
                "word": {"en": "luggage", "vi": "hành lý", "tr": "bagaj"},
                "meaning": {"en": "travel bags", "vi": "túi du lịch", "tr": "seyahat çantaları"},
                "image": "🧳",
                "example": {"en": "My luggage is heavy.", "vi": "Hành lý của tôi nặng.", "tr": "Bagajım ağır."}
            },
            {
                "word": {"en": "tourist", "vi": "du khách", "tr": "turist"},
                "meaning": {"en": "person visiting", "vi": "người đi tham quan", "tr": "ziyaretçi"},
                "image": "🧑‍🦱",
                "example": {"en": "Many tourists visit this city.", "vi": "Nhiều du khách đến thành phố này.", "tr": "Birçok turist bu şehri ziyaret eder."}
            },
            {
                "word": {"en": "vacation", "vi": "kỳ nghỉ", "tr": "tatil"},
                "meaning": {"en": "time off work", "vi": "thời gian nghỉ ngơi", "tr": "izin zamanı"},
                "image": "🏖️",
                "example": {"en": "I need a vacation.", "vi": "Tôi cần một kỳ nghỉ.", "tr": "Tatile ihtiyacım var."}
            },
            {
                "word": {"en": "journey", "vi": "hành trình", "tr": "yolculuk"},
                "meaning": {"en": "trip from place to place", "vi": "chuyến đi từ nơi này đến nơi khác", "tr": "bir yerden başka bir yere gidiş"},
                "image": "🚀",
                "example": {"en": "Enjoy your journey!", "vi": "Chúc hành trình vui vẻ!", "tr": "İyi yolculuklar!"}
            },
        ]
    },
    "health": {
        "title": {"en": "Health", "vi": "Sức khỏe", "tr": "Sağlık"},
        "items": [
            {
                "word": {"en": "doctor", "vi": "bác sĩ", "tr": "doktor"},
                "meaning": {"en": "medical professional", "vi": "chuyên gia y tế", "tr": "tıp uzmanı"},
                "image": "👨‍⚕️",
                "example": {"en": "The doctor helped me.", "vi": "Bác sĩ đã giúp tôi.", "tr": "Doktor bana yardım etti."}
            },
            {
                "word": {"en": "medicine", "vi": "thuốc", "tr": "ilaç"},
                "meaning": {"en": "drug for treatment", "vi": "thuốc để điều trị", "tr": "tedavi için ilaç"},
                "image": "💊",
                "example": {"en": "Take your medicine.", "vi": "Uống thuốc đi.", "tr": "İlacını al."}
            },
            {
                "word": {"en": "hospital", "vi": "bệnh viện", "tr": "hastane"},
                "meaning": {"en": "place for treatment", "vi": "nơi điều trị", "tr": "tedavi yeri"},
                "image": "🏥",
                "example": {"en": "He went to the hospital.", "vi": "Anh ấy đến bệnh viện.", "tr": "Hastaneye gitti."}
            },
            {
                "word": {"en": "healthy", "vi": "khỏe mạnh", "tr": "sağlıklı"},
                "meaning": {"en": "in good condition", "vi": "trong tình trạng tốt", "tr": "iyi durumda"},
                "image": "💪",
                "example": {"en": "Eat healthy food.", "vi": "Ăn thực phẩm lành mạnh.", "tr": "Sağlıklı yemek ye."}
            },
            {
                "word": {"en": "exercise", "vi": "tập thể dục", "tr": "egzersiz"},
                "meaning": {"en": "physical activity", "vi": "hoạt động thể chất", "tr": "fiziksel aktivite"},
                "image": "🏃",
                "example": {"en": "Exercise every day.", "vi": "Tập thể dục mỗi ngày.", "tr": "Her gün egzersiz yap."}
            },
            {
                "word": {"en": "fever", "vi": "sốt", "tr": "ateş"},
                "meaning": {"en": "high body temperature", "vi": "nhiệt độ cơ thể cao", "tr": "yüksek vücut ısısı"},
                "image": "🤒",
                "example": {"en": "I have a fever.", "vi": "Tôi bị sốt.", "tr": "Ateşim var."}
            },
            {
                "word": {"en": "headache", "vi": "đau đầu", "tr": "baş ağrısı"},
                "meaning": {"en": "pain in head", "vi": "đau ở đầu", "tr": "başta ağrı"},
                "image": "🤕",
                "example": {"en": "I have a headache.", "vi": "Tôi bị đau đầu.", "tr": "Başım ağrıyor."}
            },
            {
                "word": {"en": "rest", "vi": "nghỉ ngơi", "tr": "dinlenme"},
                "meaning": {"en": "relaxation", "vi": "thư giãn", "tr": "rahatlama"},
                "image": "😴",
                "example": {"en": "You need to rest.", "vi": "Bạn cần nghỉ ngơi.", "tr": "Dinlenmen gerekiyor."}
            },
        ]
    },
    "jobs": {
        "title": {"en": "Jobs", "vi": "Nghề nghiệp", "tr": "Meslekler"},
        "items": [
            {
                "word": {"en": "teacher", "vi": "giáo viên", "tr": "öğretmen"},
                "meaning": {"en": "person who teaches", "vi": "người dạy học", "tr": "öğreten kişi"},
                "image": "👩‍🏫",
                "example": {"en": "My teacher is helpful.", "vi": "Giáo viên của tôi rất hay giúp đỡ.", "tr": "Öğretmenim yardımsever."}
            },
            {
                "word": {"en": "doctor", "vi": "bác sĩ", "tr": "doktor"},
                "meaning": {"en": "medical professional", "vi": "chuyên gia y tế", "tr": "tıp uzmanı"},
                "image": "👨‍⚕️",
                "example": {"en": "I want to be a doctor.", "vi": "Tôi muốn trở thành bác sĩ.", "tr": "Doktor olmak istiyorum."}
            },
            {
                "word": {"en": "engineer", "vi": "kỹ sư", "tr": "mühendis"},
                "meaning": {"en": "designs and builds", "vi": "thiết kế và xây dựng", "tr": "tasarlayan ve inşa eden"},
                "image": "👷",
                "example": {"en": "Engineers build bridges.", "vi": "Kỹ sư xây cầu.", "tr": "Mühendisler köprü yapar."}
            },
            {
                "word": {"en": "nurse", "vi": "y tá", "tr": "hemşire"},
                "meaning": {"en": "medical assistant", "vi": "trợ lý y tế", "tr": "tıbbi asistan"},
                "image": "👩‍⚕️",
                "example": {"en": "The nurse is caring.", "vi": "Y tá rất quan tâm.", "tr": "Hemşire şefkatli."}
            },
            {
                "word": {"en": "police", "vi": "cảnh sát", "tr": "polis"},
                "meaning": {"en": "law enforcer", "vi": "người thực thi pháp luật", "tr": "yasa uygulayıcı"},
                "image": "👮",
                "example": {"en": "Police keep us safe.", "vi": "Cảnh sát giữ cho chúng ta an toàn.", "tr": "Polis bizi güvende tutar."}
            },
            {
                "word": {"en": "chef", "vi": "đầu bếp", "tr": "aşçı"},
                "meaning": {"en": "professional cook", "vi": "người nấu ăn chuyên nghiệp", "tr": "profesyonel aşçı"},
                "image": "👨‍🍳",
                "example": {"en": "The chef cooks well.", "vi": "Đầu bếp nấu ăn ngon.", "tr": "Aşçı iyi yemek yapar."}
            },
            {
                "word": {"en": "pilot", "vi": "phi công", "tr": "pilot"},
                "meaning": {"en": "flies planes", "vi": "lái máy bay", "tr": "uçak kullanan"},
                "image": "👨‍✈️",
                "example": {"en": "Pilots fly planes.", "vi": "Phi công lái máy bay.", "tr": "Pilotlar uçak kullanır."}
            },
            {
                "word": {"en": "artist", "vi": "nghệ sĩ", "tr": "sanatçı"},
                "meaning": {"en": "creates art", "vi": "tạo ra nghệ thuật", "tr": "sanat yaratan"},
                "image": "👨‍🎨",
                "example": {"en": "Artists are creative.", "vi": "Nghệ sĩ rất sáng tạo.", "tr": "Sanatçılar yaratıcıdır."}
            },
        ]
    },
    "home": {
        "title": {"en": "Home", "vi": "Nhà", "tr": "Ev"},
        "items": [
            {
                "word": {"en": "bedroom", "vi": "phòng ngủ", "tr": "yatak odası"},
                "meaning": {"en": "room for sleeping", "vi": "phòng để ngủ", "tr": "uyku odası"},
                "image": "🛏️",
                "example": {"en": "I sleep in my bedroom.", "vi": "Tôi ngủ trong phòng ngủ.", "tr": "Yatak odamda uyurum."}
            },
            {
                "word": {"en": "kitchen", "vi": "nhà bếp", "tr": "mutfak"},
                "meaning": {"en": "room for cooking", "vi": "phòng để nấu ăn", "tr": "yemek pişirme odası"},
                "image": "🍳",
                "example": {"en": "We cook in the kitchen.", "vi": "Chúng tôi nấu ăn trong bếp.", "tr": "Mutfakta yemek yaparız."}
            },
            {
                "word": {"en": "bathroom", "vi": "phòng tắm", "tr": "banyo"},
                "meaning": {"en": "room for washing", "vi": "phòng để tắm rửa", "tr": "yıkanma odası"},
                "image": "🛁",
                "example": {"en": "The bathroom is clean.", "vi": "Phòng tắm sạch sẽ.", "tr": "Banyo temiz."}
            },
            {
                "word": {"en": "garden", "vi": "vườn", "tr": "bahçe"},
                "meaning": {"en": "area with plants", "vi": "khu vực có cây cối", "tr": "bitkilerin olduğu alan"},
                "image": "🌷",
                "example": {"en": "Our garden has flowers.", "vi": "Vườn của chúng tôi có hoa.", "tr": "Bahçemizde çiçekler var."}
            },
            {
                "word": {"en": "living room", "vi": "phòng khách", "tr": "oturma odası"},
                "meaning": {"en": "room for relaxing", "vi": "phòng để thư giãn", "tr": "dinlenme odası"},
                "image": "🛋️",
                "example": {"en": "We watch TV in the living room.", "vi": "Chúng tôi xem TV trong phòng khách.", "tr": "Oturma odasında TV izleriz."}
            },
            {
                "word": {"en": "window", "vi": "cửa sổ", "tr": "pencere"},
                "meaning": {"en": "opening in wall", "vi": "lỗ mở trên tường", "tr": "duvardaki açıklık"},
                "image": "🪟",
                "example": {"en": "Open the window please.", "vi": "Làm ơn mở cửa sổ.", "tr": "Lütfen pencereyi aç."}
            },
            {
                "word": {"en": "door", "vi": "cửa", "tr": "kapı"},
                "meaning": {"en": "entrance to room", "vi": "lối vào phòng", "tr": "odaya giriş"},
                "image": "🚪",
                "example": {"en": "Close the door.", "vi": "Đóng cửa lại.", "tr": "Kapıyı kapat."}
            },
            {
                "word": {"en": "furniture", "vi": "đồ nội thất", "tr": "mobilya"},
                "meaning": {"en": "tables, chairs, etc.", "vi": "bàn, ghế, v.v.", "tr": "masa, sandalye vb."},
                "image": "🪑",
                "example": {"en": "We bought new furniture.", "vi": "Chúng tôi mua đồ nội thất mới.", "tr": "Yeni mobilya aldık."}
            },
        ]
    },
    "ielts_academic": {
        "title": {"en": "IELTS Academic", "vi": "IELTS Học thuật", "tr": "IELTS Akademik"},
        "items": [
            {
                "word": {"en": "research", "vi": "nghiên cứu", "tr": "araştırma"},
                "meaning": {"en": "systematic study", "vi": "nghiên cứu có hệ thống", "tr": "sistematik çalışma"},
                "image": "🔬",
                "example": {"en": "The research was published.", "vi": "Nghiên cứu đã được xuất bản.", "tr": "Araştırma yayınlandı."}
            },
            {
                "word": {"en": "analysis", "vi": "phân tích", "tr": "analiz"},
                "meaning": {"en": "detailed examination", "vi": "kiểm tra chi tiết", "tr": "detaylı inceleme"},
                "image": "📊",
                "example": {"en": "Data analysis is important.", "vi": "Phân tích dữ liệu rất quan trọng.", "tr": "Veri analizi önemlidir."}
            },
            {
                "word": {"en": "evidence", "vi": "bằng chứng", "tr": "kanıt"},
                "meaning": {"en": "proof", "vi": "chứng cứ", "tr": "delil"},
                "image": "📋",
                "example": {"en": "There is strong evidence.", "vi": "Có bằng chứng mạnh mẽ.", "tr": "Güçlü kanıtlar var."}
            },
            {
                "word": {"en": "conclusion", "vi": "kết luận", "tr": "sonuç"},
                "meaning": {"en": "final decision", "vi": "quyết định cuối cùng", "tr": "son karar"},
                "image": "✅",
                "example": {"en": "In conclusion, I agree.", "vi": "Kết luận, tôi đồng ý.", "tr": "Sonuç olarak, katılıyorum."}
            },
            {
                "word": {"en": "significant", "vi": "quan trọng", "tr": "önemli"},
                "meaning": {"en": "important", "vi": "có ý nghĩa", "tr": "anlamlı"},
                "image": "⭐",
                "example": {"en": "This is significant progress.", "vi": "Đây là tiến bộ quan trọng.", "tr": "Bu önemli bir ilerleme."}
            },
            {
                "word": {"en": "hypothesis", "vi": "giả thuyết", "tr": "hipotez"},
                "meaning": {"en": "proposed explanation", "vi": "giải thích được đề xuất", "tr": "önerilen açıklama"},
                "image": "💡",
                "example": {"en": "Test your hypothesis.", "vi": "Kiểm tra giả thuyết của bạn.", "tr": "Hipotezini test et."}
            },
            {
                "word": {"en": "methodology", "vi": "phương pháp", "tr": "metodoloji"},
                "meaning": {"en": "system of methods", "vi": "hệ thống phương pháp", "tr": "yöntemler sistemi"},
                "image": "📐",
                "example": {"en": "Explain your methodology.", "vi": "Giải thích phương pháp của bạn.", "tr": "Metodolojini açıkla."}
            },
            {
                "word": {"en": "evaluation", "vi": "đánh giá", "tr": "değerlendirme"},
                "meaning": {"en": "assessment", "vi": "sự đánh giá", "tr": "değerleme"},
                "image": "📝",
                "example": {"en": "The evaluation was positive.", "vi": "Đánh giá rất tích cực.", "tr": "Değerlendirme olumluydu."}
            },
        ]
    },
}

# UI Strings for games - multi-language
GAME_UI_STRINGS = {
    "matching_pairs": {
        "title": {"en": "Matching Pairs", "vi": "Ghép cặp", "tr": "Eşleştirme"},
        "description": {"en": "Find matching word-meaning pairs", "vi": "Tìm cặp từ-nghĩa phù hợp", "tr": "Kelime-anlam eşleştirmesi yap"},
        "instruction": {"en": "Click two cards to flip them.", "vi": "Nhấp vào hai thẻ để lật.", "tr": "İki kartı çevirmek için tıkla."},
    },
    "spelling_bee": {
        "title": {"en": "Spelling Bee", "vi": "Đánh vần", "tr": "Heceleme"},
        "description": {"en": "Unscramble letters to spell words", "vi": "Sắp xếp các chữ cái để đánh vần", "tr": "Harfleri düzenleyerek kelime yaz"},
        "instruction": {"en": "Type the correct word.", "vi": "Nhập từ đúng.", "tr": "Doğru kelimeyi yaz."},
    },
    "true_false": {
        "title": {"en": "True or False", "vi": "Đúng hay Sai", "tr": "Doğru mu Yanlış mı"},
        "description": {"en": "Decide if statements are true or false", "vi": "Quyết định câu đúng hay sai", "tr": "İfadelerin doğru veya yanlış olduğuna karar ver"},
        "instruction": {"en": "Click TRUE or FALSE.", "vi": "Nhấp ĐÚNG hoặc SAI.", "tr": "DOĞRU veya YANLIŞ'a tıkla."},
    },
    "word_race": {
        "title": {"en": "Word Race", "vi": "Đua từ", "tr": "Kelime Yarışı"},
        "description": {"en": "Match words to meanings quickly", "vi": "Ghép từ với nghĩa nhanh chóng", "tr": "Kelimeleri anlamlarıyla hızlıca eşleştir"},
        "instruction": {"en": "Select the correct meaning.", "vi": "Chọn nghĩa đúng.", "tr": "Doğru anlamı seç."},
    },
    "lucky_wheel": {
        "title": {"en": "Lucky Wheel", "vi": "Vòng quay may mắn", "tr": "Şans Çarkı"},
        "description": {"en": "Spin and answer random questions", "vi": "Quay và trả lời câu hỏi ngẫu nhiên", "tr": "Çevir ve rastgele sorulara cevap ver"},
        "instruction": {"en": "Answer to earn points.", "vi": "Trả lời để kiếm điểm.", "tr": "Puan kazanmak için cevapla."},
    },
    "fishing": {
        "title": {"en": "Fishing Trip", "vi": "Câu cá", "tr": "Balık Tutma"},
        "description": {"en": "Catch fish with correct words", "vi": "Bắt cá với từ đúng", "tr": "Doğru kelimelerle balık tut"},
        "instruction": {"en": "Click the correct fish.", "vi": "Nhấp vào con cá đúng.", "tr": "Doğru balığa tıkla."},
    },
}

# True/False questions - multi-language
TRUE_FALSE_QUESTIONS = [
    {
        "statement": {"en": "Cats can fly.", "vi": "Mèo có thể bay.", "tr": "Kediler uçabilir."},
        "answer": False,
        "topic": "animals"
    },
    {
        "statement": {"en": "The sun rises in the east.", "vi": "Mặt trời mọc ở phía đông.", "tr": "Güneş doğudan doğar."},
        "answer": True,
        "topic": "nature"
    },
    {
        "statement": {"en": "Fish live in water.", "vi": "Cá sống dưới nước.", "tr": "Balıklar suda yaşar."},
        "answer": True,
        "topic": "animals"
    },
    {
        "statement": {"en": "Apples are blue.", "vi": "Táo có màu xanh dương.", "tr": "Elmalar mavidir."},
        "answer": False,
        "topic": "colors"
    },
    {
        "statement": {"en": "Elephants are big animals.", "vi": "Voi là động vật lớn.", "tr": "Filler büyük hayvanlardır."},
        "answer": True,
        "topic": "animals"
    },
    {
        "statement": {"en": "Ice is hot.", "vi": "Đá nóng.", "tr": "Buz sıcaktır."},
        "answer": False,
        "topic": "science"
    },
    {
        "statement": {"en": "We use pencils to write.", "vi": "Chúng ta dùng bút chì để viết.", "tr": "Yazmak için kalem kullanırız."},
        "answer": True,
        "topic": "school"
    },
    {
        "statement": {"en": "Birds have four legs.", "vi": "Chim có bốn chân.", "tr": "Kuşların dört bacağı vardır."},
        "answer": False,
        "topic": "animals"
    },
    {
        "statement": {"en": "The moon shines at night.", "vi": "Mặt trăng chiếu sáng vào ban đêm.", "tr": "Ay geceleri parlar."},
        "answer": True,
        "topic": "nature"
    },
    {
        "statement": {"en": "Dogs say 'meow'.", "vi": "Chó kêu 'meo meo'.", "tr": "Köpekler 'miyav' der."},
        "answer": False,
        "topic": "animals"
    },
    {
        "statement": {"en": "Water is a liquid.", "vi": "Nước là chất lỏng.", "tr": "Su bir sıvıdır."},
        "answer": True,
        "topic": "science"
    },
    {
        "statement": {"en": "Bananas are purple.", "vi": "Chuối có màu tím.", "tr": "Muzlar mordur."},
        "answer": False,
        "topic": "food"
    },
]


# ============ LANGUAGE HELPER ============

def get_localized(obj: dict, lang: str, fallback: str = "") -> str:
    """Get localized text from a multi-language object"""
    if not obj or not isinstance(obj, dict):
        return fallback
    return obj.get(lang, obj.get("en", fallback))


def filter_items_by_language(items: list, lang: str) -> list:
    """Filter items that have content in the specified language"""
    return [
        item for item in items 
        if item.get("word", {}).get(lang) and item.get("meaning", {}).get(lang)
    ]


# ============ GAME GENERATORS ============

def generate_matching_game(topic: str, count: int = 6, lang: str = "en") -> GameConfig:
    """Generate a memory/matching pairs game"""
    topic_data = VOCABULARY_DATA.get(topic, VOCABULARY_DATA["family"])
    items = filter_items_by_language(topic_data["items"], lang)
    
    if len(items) < 2:
        raise HTTPException(status_code=404, detail=f"Not enough content for topic '{topic}' in language '{lang}'")
    
    selected = random.sample(items, min(count, len(items)))
    
    pairs = []
    for item in selected:
        word = get_localized(item["word"], lang)
        meaning = get_localized(item["meaning"], lang)
        
        pairs.append({
            "id": f"word_{word}",
            "content": word,
            "type": "word",
            "match_id": f"meaning_{word}"
        })
        pairs.append({
            "id": f"meaning_{word}",
            "content": f"{item['image']} {meaning}",
            "type": "meaning",
            "match_id": f"word_{word}"
        })
    
    random.shuffle(pairs)
    
    ui = GAME_UI_STRINGS["matching_pairs"]
    topic_title = get_localized(topic_data["title"], lang, topic)
    
    return GameConfig(
        game_id=f"matching_{topic}_{random.randint(1000,9999)}",
        game_type="matching_pairs",
        title=f"{get_localized(ui['title'], lang)}: {topic_title}",
        description=get_localized(ui["description"], lang),
        difficulty="easy",
        time_limit=120,
        questions=pairs
    )


def generate_spelling_bee(topic: str, count: int = 5, lang: str = "en") -> GameConfig:
    """Generate a spelling bee game"""
    topic_data = VOCABULARY_DATA.get(topic, VOCABULARY_DATA["family"])
    items = filter_items_by_language(topic_data["items"], lang)
    
    if len(items) < 2:
        raise HTTPException(status_code=404, detail=f"Not enough content for topic '{topic}' in language '{lang}'")
    
    selected = random.sample(items, min(count, len(items)))
    
    questions = []
    for item in selected:
        word = get_localized(item["word"], lang)
        meaning = get_localized(item["meaning"], lang)
        
        # Scramble the word
        letters = list(word)
        random.shuffle(letters)
        scrambled = "".join(letters)
        
        # Make sure it's actually scrambled
        attempts = 0
        while scrambled == word and len(word) > 2 and attempts < 10:
            random.shuffle(letters)
            scrambled = "".join(letters)
            attempts += 1
        
        questions.append({
            "id": f"spell_{word}",
            "scrambled": scrambled.upper(),
            "correct_answer": word,
            "hint": meaning,
            "image": item["image"],
            "example": get_localized(item.get("example", {}), lang, "")
        })
    
    ui = GAME_UI_STRINGS["spelling_bee"]
    topic_title = get_localized(topic_data["title"], lang, topic)
    
    return GameConfig(
        game_id=f"spelling_{topic}_{random.randint(1000,9999)}",
        game_type="spelling_bee",
        title=f"{get_localized(ui['title'], lang)}: {topic_title}",
        description=get_localized(ui["description"], lang),
        difficulty="medium",
        time_limit=180,
        questions=questions
    )


def generate_true_false(count: int = 8, lang: str = "en") -> GameConfig:
    """Generate a true/false quiz"""
    # Filter questions that have translation for the language
    available = [q for q in TRUE_FALSE_QUESTIONS if q["statement"].get(lang)]
    
    if len(available) < 2:
        raise HTTPException(status_code=404, detail=f"Not enough true/false content in language '{lang}'")
    
    selected = random.sample(available, min(count, len(available)))
    
    questions = []
    for idx, q in enumerate(selected):
        questions.append({
            "id": f"tf_{idx}",
            "statement": get_localized(q["statement"], lang),
            "correct_answer": q["answer"],
            "topic": q["topic"]
        })
    
    ui = GAME_UI_STRINGS["true_false"]
    
    return GameConfig(
        game_id=f"truefalse_{random.randint(1000,9999)}",
        game_type="true_false",
        title=get_localized(ui["title"], lang),
        description=get_localized(ui["description"], lang),
        difficulty="easy",
        time_limit=90,
        questions=questions
    )


def generate_word_race(topic: str, count: int = 8, lang: str = "en") -> GameConfig:
    """Generate a word race (multiple choice) game"""
    topic_data = VOCABULARY_DATA.get(topic, VOCABULARY_DATA["family"])
    items = filter_items_by_language(topic_data["items"], lang)
    
    if len(items) < 4:
        raise HTTPException(status_code=404, detail=f"Not enough content for topic '{topic}' in language '{lang}'")
    
    selected = random.sample(items, min(count, len(items)))
    all_meanings = [get_localized(item["meaning"], lang) for item in items]
    
    questions = []
    for item in selected:
        word = get_localized(item["word"], lang)
        correct = get_localized(item["meaning"], lang)
        
        # Get wrong options
        wrong = [m for m in all_meanings if m != correct]
        wrong_options = random.sample(wrong, min(3, len(wrong)))
        
        options = [correct] + wrong_options
        random.shuffle(options)
        
        questions.append({
            "id": f"race_{word}",
            "word": word,
            "image": item["image"],
            "options": options,
            "correct_answer": correct
        })
    
    ui = GAME_UI_STRINGS["word_race"]
    topic_title = get_localized(topic_data["title"], lang, topic)
    
    return GameConfig(
        game_id=f"race_{topic}_{random.randint(1000,9999)}",
        game_type="word_race",
        title=f"{get_localized(ui['title'], lang)}: {topic_title}",
        description=get_localized(ui["description"], lang),
        difficulty="medium",
        time_limit=60,
        questions=questions
    )


def generate_lucky_wheel(topics: List[str] = None, lang: str = "en") -> GameConfig:
    """Generate a lucky wheel game with random topics"""
    if not topics:
        topics = list(VOCABULARY_DATA.keys())
    
    questions = []
    points_options = [10, 20, 30, 40, 50]
    
    for topic in topics:
        topic_data = VOCABULARY_DATA.get(topic)
        if not topic_data:
            continue
            
        items = filter_items_by_language(topic_data["items"], lang)
        if not items:
            continue
            
        item = random.choice(items)
        word = get_localized(item["word"], lang)
        meaning = get_localized(item["meaning"], lang)
        
        questions.append({
            "id": f"wheel_{topic}_{word}",
            "topic": get_localized(topic_data["title"], lang, topic),
            "word": word,
            "meaning": meaning,
            "image": item["image"],
            "points": random.choice(points_options)
        })
    
    if not questions:
        raise HTTPException(status_code=404, detail=f"No content available in language '{lang}'")
    
    random.shuffle(questions)
    
    ui = GAME_UI_STRINGS["lucky_wheel"]
    
    return GameConfig(
        game_id=f"wheel_{random.randint(1000,9999)}",
        game_type="lucky_wheel",
        title=get_localized(ui["title"], lang),
        description=get_localized(ui["description"], lang),
        difficulty="medium",
        time_limit=None,
        questions=questions[:12]
    )


def generate_fishing_game(topic: str, count: int = 8, lang: str = "en") -> GameConfig:
    """Generate a fishing game"""
    topic_data = VOCABULARY_DATA.get(topic, VOCABULARY_DATA["family"])
    items = filter_items_by_language(topic_data["items"], lang)
    
    if len(items) < 4:
        raise HTTPException(status_code=404, detail=f"Not enough content for topic '{topic}' in language '{lang}'")
    
    selected = random.sample(items, min(count, len(items)))
    all_words = [get_localized(item["word"], lang) for item in items]
    
    questions = []
    fish_colors = ["🐟", "🐠", "🐡", "🦈", "🐳", "🐋", "🦑", "🐙"]
    
    for idx, item in enumerate(selected):
        word = get_localized(item["word"], lang)
        meaning = get_localized(item["meaning"], lang)
        
        # Get wrong options
        wrong = [w for w in all_words if w != word]
        wrong_options = random.sample(wrong, min(3, len(wrong)))
        
        fish = [
            {"word": word, "fish": fish_colors[idx % len(fish_colors)], "correct": True}
        ]
        for w in wrong_options:
            fish.append({"word": w, "fish": random.choice(fish_colors), "correct": False})
        
        random.shuffle(fish)
        
        questions.append({
            "id": f"fish_{idx}",
            "clue": meaning,
            "image": item["image"],
            "fish": fish,
            "correct_answer": word
        })
    
    ui = GAME_UI_STRINGS["fishing"]
    topic_title = get_localized(topic_data["title"], lang, topic)
    
    return GameConfig(
        game_id=f"fish_{topic}_{random.randint(1000,9999)}",
        game_type="fishing",
        title=f"{get_localized(ui['title'], lang)}: {topic_title}",
        description=get_localized(ui["description"], lang),
        difficulty="easy",
        time_limit=120,
        questions=questions
    )


# ============ API ENDPOINTS ============

@router.get("/list")
async def list_available_games(
    lang: str = "en",
    x_system_language: Optional[str] = Header(None, alias="X-System-Language")
):
    """List all available game types and topics"""
    # Use header if provided, otherwise query param
    system_lang = x_system_language or lang
    if system_lang not in ["en", "vi", "tr"]:
        system_lang = "en"
    
    games = []
    for game_type, ui in GAME_UI_STRINGS.items():
        games.append({
            "type": game_type,
            "title": get_localized(ui["title"], system_lang),
            "description": get_localized(ui["description"], system_lang),
            "icon": {"matching_pairs": "🎴", "spelling_bee": "🐝", "true_false": "✅", 
                     "word_race": "🏃", "lucky_wheel": "🎡", "fishing": "🎣"}[game_type],
            "color": {"matching_pairs": "from-pink-500 to-rose-500", "spelling_bee": "from-amber-500 to-yellow-500",
                      "true_false": "from-green-500 to-emerald-500", "word_race": "from-blue-500 to-indigo-500",
                      "lucky_wheel": "from-purple-500 to-violet-500", "fishing": "from-cyan-500 to-teal-500"}[game_type]
        })
    
    # Filter topics that have content in current language
    available_topics = []
    for topic_id, topic_data in VOCABULARY_DATA.items():
        items = filter_items_by_language(topic_data["items"], system_lang)
        if items:
            available_topics.append({
                "id": topic_id,
                "title": get_localized(topic_data["title"], system_lang, topic_id),
                "item_count": len(items)
            })
    
    return {
        "games": games,
        "topics": available_topics,
        "language": system_lang
    }


@router.get("/play/{game_type}")
async def get_game(
    game_type: str,
    topic: str = "family",
    count: int = 6,
    lang: str = "en",
    x_system_language: Optional[str] = Header(None, alias="X-System-Language")
):
    """Generate and return a specific game"""
    # Use header if provided, otherwise query param
    system_lang = x_system_language or lang
    if system_lang not in ["en", "vi", "tr"]:
        system_lang = "en"
    
    generators = {
        "matching_pairs": lambda: generate_matching_game(topic, count, system_lang),
        "spelling_bee": lambda: generate_spelling_bee(topic, count, system_lang),
        "true_false": lambda: generate_true_false(count, system_lang),
        "word_race": lambda: generate_word_race(topic, count, system_lang),
        "lucky_wheel": lambda: generate_lucky_wheel(lang=system_lang),
        "fishing": lambda: generate_fishing_game(topic, count, system_lang)
    }
    
    if game_type not in generators:
        raise HTTPException(status_code=400, detail=f"Unknown game type: {game_type}")
    
    game = generators[game_type]()
    
    return {
        "success": True,
        "game": game.dict(),
        "language": system_lang
    }


@router.post("/submit/{game_id}")
async def submit_game_score(
    game_id: str,
    score: int,
    total: int,
    time_taken: Optional[int] = None,
    lang: str = "en",
    x_system_language: Optional[str] = Header(None, alias="X-System-Language")
):
    """Submit game score and get results"""
    system_lang = x_system_language or lang
    if system_lang not in ["en", "vi", "tr"]:
        system_lang = "en"
    
    percentage = (score / total * 100) if total > 0 else 0
    
    # Determine stars
    if percentage >= 90:
        stars = 3
    elif percentage >= 70:
        stars = 2
    elif percentage >= 50:
        stars = 1
    else:
        stars = 0
    
    # Multi-language messages
    messages = {
        3: {"en": "Perfect! Amazing job!", "vi": "Hoàn hảo! Tuyệt vời!", "tr": "Mükemmel! Harika iş!"},
        2: {"en": "Great work! Keep it up!", "vi": "Tốt lắm! Tiếp tục nhé!", "tr": "Harika! Devam et!"},
        1: {"en": "Good try! Practice more!", "vi": "Cố gắng tốt! Luyện tập thêm!", "tr": "İyi deneme! Daha çok çalış!"},
        0: {"en": "Keep learning!", "vi": "Tiếp tục học nhé!", "tr": "Öğrenmeye devam et!"}
    }
    
    return {
        "success": True,
        "game_id": game_id,
        "score": score,
        "total": total,
        "percentage": round(percentage, 1),
        "stars": stars,
        "message": messages[stars].get(system_lang, messages[stars]["en"]),
        "time_taken": time_taken,
        "language": system_lang
    }


print("✅ Multi-Language Game Bank routes loaded")
