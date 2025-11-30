from typing import Dict, List, Optional
from datetime import datetime
import uuid
import re
from data.chatbot_conversations import fake_conversations_db
from data.fake_tutors import fake_tutors_db
from data.profiles import fake_profiles_db
from schemas.chatbot import ChatMessage, ChatConversation, ChatRequest, ChatResponse


class ChatbotService:
    def __init__(self):
        # Từ khóa để nhận diện các chủ đề
        self.keywords = {
            "web": ["web", "website", "frontend", "backend", "html", "css", "javascript", "react", "nodejs"],
            "ml": ["machine learning", "ml", "ai", "trí tuệ nhân tạo", "deep learning", "neural network", "python"],
            "security": ["security", "an ninh", "cybersecurity", "hacking", "network", "bảo mật"],
            "blockchain": ["blockchain", "crypto", "bitcoin", "ethereum", "solidity", "web3", "defi"],
            "game": ["game", "unity", "unreal", "game development", "game dev"],
            "cv": ["computer vision", "cv", "image processing", "opencv", "tensorflow", "xử lý ảnh"],
            "dsa": ["algorithm", "data structure", "thuật toán", "cấu trúc dữ liệu", "dsa", "leetcode"]
        }
        
        # Mapping từ keyword đến tags (normalize về lowercase để match chính xác)
        self.keyword_to_tags = {
            "web": ["web", "dsa"],  # Web development thường cần DSA
            "ml": ["python", "ml"],
            "security": ["security", "network"],
            "blockchain": ["blockchain", "web3", "solidity"],
            "game": ["game development", "unity"],
            "cv": ["cv", "opencv", "tensorflow"],
            "dsa": ["dsa"]
        }
        
        # Các câu hỏi để thu thập thông tin
        self.questions = [
            {
                "key": "linh_vuc",
                "question": "Bạn muốn học về lĩnh vực nào? (Ví dụ: Web Development, Machine Learning, Blockchain, Security, Game Development, Computer Vision, v.v.)",
                "extract_keywords": ["web", "ml", "security", "blockchain", "game", "cv", "dsa"]
            },
            {
                "key": "muc_tieu",
                "question": "Mục tiêu học tập của bạn là gì? (Ví dụ: Nâng cao kỹ năng, Chuẩn bị cho dự án, Ôn thi, Tìm hiểu kiến thức mới, v.v.)",
                "extract_keywords": []
            },
            {
                "key": "trinh_do",
                "question": "Trình độ hiện tại của bạn như thế nào? (Ví dụ: Mới bắt đầu, Có kiến thức cơ bản, Trung bình, Nâng cao)",
                "extract_keywords": ["mới bắt đầu", "cơ bản", "trung bình", "nâng cao", "beginner", "intermediate", "advanced"]
            },
            {
                "key": "thoi_gian",
                "question": "Bạn có thời gian rảnh vào lúc nào? (Ví dụ: Buổi sáng, Buổi chiều, Buổi tối, Cuối tuần, hoặc cụ thể như T2 19:00-21:00)",
                "extract_keywords": ["sáng", "chiều", "tối", "cuối tuần", "t2", "t3", "t4", "t5", "t6", "t7", "cn"]
            },
            {
                "key": "hinh_thuc",
                "question": "Bạn muốn học theo hình thức nào? (Online hoặc Offline)",
                "extract_keywords": ["online", "offline", "trực tuyến", "trực tiếp"]
            },
            {
                "key": "kho_khan",
                "question": "Bạn đang gặp khó khăn gì trong học tập? (Ví dụ: Không hiểu thuật toán, Khó khăn với framework, Cần hướng dẫn dự án, v.v.)",
                "extract_keywords": []
            }
        ]

    def process_message(self, request: ChatRequest) -> ChatResponse:
        """Xử lý tin nhắn từ user và trả về phản hồi"""
        user_message = request.message.lower()
        conversation_id = request.conversation_id
        
        # Tạo hoặc lấy conversation
        if not conversation_id or conversation_id not in fake_conversations_db:
            conversation_id = str(uuid.uuid4())
            conversation = {
                "conversation_id": conversation_id,
                "user_id": request.user_id,
                "messages": [],
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "matched_tutors": [],
                "collected_info": {}  # Lưu trữ thông tin đã thu thập
            }
            fake_conversations_db[conversation_id] = conversation
        else:
            conversation = fake_conversations_db[conversation_id]
        
        # Thêm tin nhắn của user vào conversation
        user_msg = ChatMessage(
            role="user",
            content=request.message,
            timestamp=datetime.now().isoformat()
        )
        conversation["messages"].append(user_msg.dict())
        
        # Thu thập thông tin từ tin nhắn
        self._collect_info(conversation, user_message)
        
        # Xác định câu hỏi tiếp theo
        next_question = self._get_next_question(conversation)
        
        # Nếu đã có lĩnh vực (thông tin quan trọng nhất), có thể tìm tutor ngay
        # Hoặc nếu đã thu thập đủ thông tin, tìm tutor
        collected_info = conversation.get("collected_info", {})
        has_linh_vuc = collected_info.get("linh_vuc", "").strip()
        
        if not next_question or (has_linh_vuc and next_question and next_question.get("key") != "linh_vuc"):
            # Đã có đủ thông tin cơ bản để tìm tutor
            matched_tutors = self._analyze_and_match(conversation, request.user_id)
            conversation["matched_tutors"] = [t["tutorID"] for t in matched_tutors]
        else:
            matched_tutors = []
        
        # Tạo phản hồi của chatbot
        bot_response = self._generate_response(user_message, matched_tutors, next_question, conversation)
        
        # Thêm phản hồi của bot vào conversation
        bot_msg = ChatMessage(
            role="assistant",
            content=bot_response["message"],
            timestamp=datetime.now().isoformat()
        )
        conversation["messages"].append(bot_msg.dict())
        conversation["updated_at"] = datetime.now().isoformat()
        
        # Tạo suggestions
        suggestions = self._generate_suggestions(user_message, matched_tutors, next_question, conversation)
        
        return ChatResponse(
            conversation_id=conversation_id,
            message=bot_response["message"],
            matched_tutors=matched_tutors,
            suggestions=suggestions
        )

    def _collect_info(self, conversation: Dict, message: str):
        """Thu thập thông tin từ tin nhắn của user"""
        collected_info = conversation.get("collected_info", {})
        message_lower = message.lower()
        
        # Thu thập lĩnh vực (có thể cập nhật nếu user thay đổi ý định)
        # Tìm lĩnh vực mới trong tin nhắn
        detected_topic = None
        for topic, keywords in self.keywords.items():
            for keyword in keywords:
                if keyword in message_lower:
                    detected_topic = topic
                    break
            if detected_topic:
                break
        
        # Cập nhật lĩnh vực nếu tìm thấy
        if detected_topic:
            collected_info["linh_vuc"] = detected_topic
        
        # Thu thập mục tiêu (cập nhật nếu có từ khóa mới)
        muc_tieu_keywords = ["nâng cao", "dự án", "ôn thi", "kiến thức mới", "kỹ năng", "project", "exam", "chuẩn bị", "học tập"]
        if any(kw in message_lower for kw in muc_tieu_keywords):
            # Lưu toàn bộ message nếu có từ khóa liên quan
            if "muc_tieu" not in collected_info or len(message.strip()) > len(collected_info.get("muc_tieu", "").strip()):
                collected_info["muc_tieu"] = message
        
        # Thu thập trình độ (cập nhật nếu có từ khóa mới)
        trinh_do_keywords = {
            "mới bắt đầu": ["mới bắt đầu", "beginner", "mới học", "chưa biết", "chưa biết gì", "mới"],
            "cơ bản": ["cơ bản", "basic", "biết một chút", "biết ít"],
            "trung bình": ["trung bình", "intermediate", "biết một ít", "khá"],
            "nâng cao": ["nâng cao", "advanced", "giỏi", "thành thạo", "expert"]
        }
        for level, keywords in trinh_do_keywords.items():
            if any(kw in message_lower for kw in keywords):
                collected_info["trinh_do"] = level
                break
        
        # Thu thập thời gian (cập nhật nếu có thông tin mới)
        thoi_gian_keywords = ["sáng", "chiều", "tối", "cuối tuần", "t2", "t3", "t4", "t5", "t6", "t7", "cn", "thứ 2", "thứ 3", "thứ 4", "thứ 5", "thứ 6", "thứ 7", "chủ nhật", "morning", "afternoon", "evening", "19:00", "20:00", "21:00"]
        if any(kw in message_lower for kw in thoi_gian_keywords):
            collected_info["thoi_gian"] = message
        
        # Thu thập hình thức (cập nhật nếu có thông tin mới)
        if "online" in message_lower or "trực tuyến" in message_lower or "on-line" in message_lower:
            collected_info["hinh_thuc"] = "Online"
        elif "offline" in message_lower or "trực tiếp" in message_lower or "off-line" in message_lower:
            collected_info["hinh_thuc"] = "Offline"
        
        # Thu thập khó khăn (cập nhật nếu có thông tin mới)
        kho_khan_keywords = ["khó", "không hiểu", "gặp vấn đề", "cần giúp", "help", "problem", "difficult", "khó khăn", "gặp khó"]
        if any(kw in message_lower for kw in kho_khan_keywords):
            collected_info["kho_khan"] = message
        
        conversation["collected_info"] = collected_info

    def _get_next_question(self, conversation: Dict) -> Optional[Dict]:
        """Xác định câu hỏi tiếp theo cần hỏi"""
        collected_info = conversation.get("collected_info", {})
        
        # Ưu tiên các câu hỏi quan trọng
        # Lĩnh vực là quan trọng nhất, nếu không có thì không thể match tutor
        priority_order = ["linh_vuc", "trinh_do", "muc_tieu", "thoi_gian", "hinh_thuc", "kho_khan"]
        
        for key in priority_order:
            # Kiểm tra xem field có giá trị hợp lệ không (không phải empty string)
            if key not in collected_info or not str(collected_info.get(key, "")).strip():
                for q in self.questions:
                    if q["key"] == key:
                        return q
        
        return None  # Đã thu thập đủ thông tin

    def _analyze_and_match(self, conversation: Dict, user_id: str) -> List[Dict]:
        """Phân tích thông tin đã thu thập và tìm tutor phù hợp"""
        collected_info = conversation.get("collected_info", {})
        detected_tags = []
        detected_topics = []
        
        # Phân tích toàn bộ conversation history để tìm từ khóa
        messages = conversation.get("messages", [])
        all_text = " ".join([msg.get("content", "").lower() for msg in messages if msg.get("role") == "user"])
        
        # Lấy lĩnh vực đã thu thập
        linh_vuc = collected_info.get("linh_vuc")
        if linh_vuc and linh_vuc in self.keyword_to_tags:
            detected_topics.append(linh_vuc)
            detected_tags.extend(self.keyword_to_tags[linh_vuc])
        
        # Phân tích từ khóa từ toàn bộ conversation
        for topic, keywords in self.keywords.items():
            for keyword in keywords:
                if keyword in all_text and topic not in detected_topics:
                    detected_topics.append(topic)
                    if topic in self.keyword_to_tags:
                        detected_tags.extend(self.keyword_to_tags[topic])
        
        # Lấy thông tin profile của user (chỉ dùng nếu chưa có thông tin từ conversation)
        if not detected_tags:
            user_profile = fake_profiles_db.get(user_id)
            if user_profile:
                user_tags = user_profile.get("tags", [])
                user_linh_vuc = user_profile.get("linh_vuc_quan_tam", [])
                detected_tags.extend([tag.lower() for tag in user_tags])
                detected_tags.extend([lv.lower() for lv in user_linh_vuc])
        
        # Loại bỏ duplicate và normalize tags
        detected_tags = list(set([tag.lower().strip() for tag in detected_tags if tag]))
        
        # Nếu không có thông tin gì, không trả về tutor nào
        if not detected_tags and not detected_topics:
            return []
        
        # Tìm tutor phù hợp
        matched_tutors = []
        hinh_thuc = collected_info.get("hinh_thuc", "").lower()
        thoi_gian = collected_info.get("thoi_gian", "").lower()
        trinh_do = collected_info.get("trinh_do", "")
        muc_tieu = collected_info.get("muc_tieu", "").lower()
        kho_khan = collected_info.get("kho_khan", "").lower()
        
        for tutor_id, tutor in fake_tutors_db.items():
            score = 0
            has_match = False  # Đánh dấu có match thực sự không
            tutor_tags = [tag.lower() for tag in tutor.get("tags", [])]
            tutor_major = tutor.get("major", "").lower()
            tutor_profile_text = tutor.get("profile", "").lower()
            
            # 1. Matching theo tags và topics (quan trọng nhất)
            tag_match_count = 0
            for tag in detected_tags:
                # Exact match trong tags (case-insensitive)
                tag_normalized = tag.lower().strip()
                if tag_normalized in tutor_tags:
                    score += 5  # Điểm cao cho exact match
                    has_match = True
                    tag_match_count += 1
                # Partial match trong tags (kiểm tra xem tag có nằm trong tutor_tag không)
                elif any(tag_normalized in tutor_tag.lower() or tutor_tag.lower() in tag_normalized for tutor_tag in tutor_tags):
                    score += 3
                    has_match = True
                    tag_match_count += 1
                # Match trong major
                if tag_normalized in tutor_major:
                    score += 2
                    has_match = True
                # Match trong profile
                if tag_normalized in tutor_profile_text:
                    score += 1.5
                    has_match = True
            
            # 2. Matching theo topics trong profile
            for topic in detected_topics:
                topic_keywords = self.keywords.get(topic, [])
                for keyword in topic_keywords:
                    if keyword in tutor_profile_text:
                        score += 2
                        has_match = True
                        break
            
            # 3. Matching theo hình thức và thời gian
            if hinh_thuc:
                tutor_profile = fake_profiles_db.get(tutor_id)
                if tutor_profile:
                    lich_ranh = tutor_profile.get("lich_ranh", [])
                    has_schedule_match = False
                    for schedule in lich_ranh:
                        schedule_time = schedule.get("time", "").lower()
                        # Kiểm tra hình thức (không cần exact match vì lịch rảnh có thể không ghi rõ)
                        if thoi_gian and any(day in schedule_time for day in ["t2", "t3", "t4", "t5", "t6", "t7", "cn"] if day in thoi_gian):
                            score += 2
                            has_schedule_match = True
                    if not has_schedule_match and hinh_thuc:
                        # Nếu không match lịch rảnh, giảm điểm một chút
                        score -= 0.5
            
            # 4. Matching theo trình độ
            if trinh_do:
                tutor_rating = tutor.get("rating", 0)
                if trinh_do == "nâng cao" and tutor_rating >= 4.5:
                    score += 1.5
                elif trinh_do == "mới bắt đầu" and 4.0 <= tutor_rating < 4.5:
                    score += 1.5  # Tutor rating vừa phải phù hợp với người mới
                elif trinh_do == "cơ bản" and 4.0 <= tutor_rating < 4.7:
                    score += 1
                elif trinh_do == "trung bình" and 4.3 <= tutor_rating < 4.8:
                    score += 1
            
            # 5. Matching theo mục tiêu và khó khăn (nếu có)
            if muc_tieu:
                muc_tieu_keywords = ["dự án", "project", "ôn thi", "exam", "nâng cao", "improve"]
                for keyword in muc_tieu_keywords:
                    if keyword in muc_tieu and keyword in tutor_profile_text:
                        score += 1
            
            if kho_khan:
                # Tìm từ khóa liên quan đến khó khăn trong profile tutor
                kho_khan_keywords = ["kinh nghiệm", "hướng dẫn", "support", "help", "tutorial"]
                for keyword in kho_khan_keywords:
                    if keyword in tutor_profile_text:
                        score += 0.5
            
            # 6. Chỉ cộng điểm rating nếu đã có match về tags/topics
            if has_match:
                score += tutor.get("rating", 0) * 0.3  # Giảm trọng số rating
            else:
                # Nếu không có match nào, không thêm vào danh sách
                continue
            
            # Chỉ thêm tutor có score >= 3 (ngưỡng tối thiểu)
            if score >= 3:
                matched_tutors.append({
                    "tutorID": tutor_id,
                    "full_name": tutor.get("full_name"),
                    "rating": tutor.get("rating"),
                    "major": tutor.get("major"),
                    "tags": tutor.get("tags"),
                    "profile": tutor.get("profile"),
                    "score": round(score, 2)
                })
        
        # Sắp xếp theo score giảm dần
        matched_tutors.sort(key=lambda x: x["score"], reverse=True)
        
        # Chỉ trả về tutor có score cao nhất, tối đa 5 tutor
        # Nhưng chỉ trả về nếu có ít nhất 1 tutor với score >= 5 (rất phù hợp)
        if matched_tutors and matched_tutors[0]["score"] >= 5:
            # Trả về top tutors, nhưng chỉ những tutor có score >= 4
            return [t for t in matched_tutors if t["score"] >= 4][:5]
        elif matched_tutors:
            # Nếu không có tutor nào score >= 5, chỉ trả về top 3 với score >= 3
            return matched_tutors[:3]
        else:
            # Không có tutor nào phù hợp
            return []

    def _generate_response(self, message: str, matched_tutors: List[Dict], next_question: Optional[Dict], conversation: Dict) -> Dict:
        """Tạo phản hồi tự nhiên của chatbot"""
        greeting_patterns = ["xin chào", "hello", "hi", "chào", "helo"]
        goodbye_patterns = ["cảm ơn", "thank", "tạm biệt", "bye", "goodbye"]
        message_lower = message.lower()
        
        # Chào hỏi
        if any(pattern in message_lower for pattern in greeting_patterns):
            return {
                "message": "Xin chào! 👋 Tôi là trợ lý AI của HCMUT_TSS. Tôi sẽ giúp bạn tìm tutor phù hợp nhất bằng cách hỏi một số câu hỏi để hiểu rõ nhu cầu của bạn.\n\n" + self.questions[0]["question"]
            }
        
        # Tạm biệt
        if any(pattern in message_lower for pattern in goodbye_patterns):
            return {
                "message": "Cảm ơn bạn đã sử dụng dịch vụ! Chúc bạn học tập tốt. Nếu cần hỗ trợ thêm, đừng ngần ngại quay lại nhé! 👋"
            }
        
        # Nếu có câu hỏi tiếp theo, hỏi tiếp
        if next_question:
            collected_info = conversation.get("collected_info", {})
            response = "Cảm ơn bạn đã cung cấp thông tin! "
            
            # Xác nhận thông tin vừa nhận được
            if next_question["key"] == "muc_tieu" and "linh_vuc" in collected_info:
                response += f"Tôi hiểu bạn quan tâm đến {collected_info.get('linh_vuc', 'lĩnh vực này')}. "
            elif next_question["key"] == "trinh_do" and "muc_tieu" in collected_info:
                response += "Tốt! "
            elif next_question["key"] == "thoi_gian" and "trinh_do" in collected_info:
                response += "Được rồi! "
            elif next_question["key"] == "hinh_thuc" and "thoi_gian" in collected_info:
                response += "Tuyệt vời! "
            elif next_question["key"] == "kho_khan" and "hinh_thuc" in collected_info:
                response += "Cảm ơn bạn! "
            
            response += "\n\n" + next_question["question"]
            return {"message": response}
        
        # Nếu đã thu thập đủ thông tin và có tutor match
        if matched_tutors:
            collected_info = conversation.get("collected_info", {})
            response = "Dựa trên thông tin bạn đã cung cấp, tôi đã tìm thấy "
            
            if len(matched_tutors) == 1:
                tutor = matched_tutors[0]
                response += f"1 tutor phù hợp nhất với bạn:\n\n"
                response += f"👤 **{tutor['full_name']}**\n"
                response += f"⭐ Đánh giá: {tutor['rating']}/5.0\n"
                response += f"📚 Chuyên ngành: {tutor['major']}\n"
                response += f"🏷️ Tags: {', '.join(tutor['tags'])}\n"
                response += f"📝 {tutor['profile']}\n\n"
                response += "Bạn có muốn xem thêm thông tin chi tiết hoặc đăng ký buổi tư vấn với tutor này không?"
            else:
                response += f"{len(matched_tutors)} tutor phù hợp với bạn:\n\n"
                for i, tutor in enumerate(matched_tutors, 1):
                    response += f"{i}. **{tutor['full_name']}** (⭐ {tutor['rating']}/5.0, Độ phù hợp: {tutor['score']}/10)\n"
                    response += f"   - {tutor['major']} | {', '.join(tutor['tags'])}\n"
                    response += f"   - {tutor['profile'][:80]}...\n\n"
                response += "Bạn muốn xem thông tin chi tiết của tutor nào?"
            
            return {"message": response}
        
        # Nếu không có tutor match
        collected_info = conversation.get("collected_info", {})
        linh_vuc = collected_info.get("linh_vuc", "")
        
        if linh_vuc:
            response = f"Tôi đã tìm kiếm nhưng chưa tìm thấy tutor nào phù hợp với lĩnh vực '{linh_vuc}' mà bạn quan tâm.\n\n"
            response += "Bạn có thể:\n"
            response += "• Thử tìm kiếm với lĩnh vực khác\n"
            response += "• Hoặc mô tả chi tiết hơn về nhu cầu của bạn\n"
            response += "• Hoặc sử dụng chức năng tìm kiếm thủ công ở trang 'Tìm kiếm Tutor'"
        else:
            response = "Tôi hiểu bạn đang tìm kiếm tutor. Để tôi có thể tìm tutor phù hợp nhất, bạn có thể cho tôi biết thêm:\n"
            response += "• Bạn muốn học về lĩnh vực nào? (Web, ML, Security, Blockchain, Game, v.v.)\n"
            response += "• Trình độ hiện tại của bạn?\n"
            response += "• Bạn có thời gian rảnh vào lúc nào?"
        
        return {"message": response}

    def _generate_suggestions(self, message: str, matched_tutors: List[Dict], next_question: Optional[Dict], conversation: Dict) -> List[str]:
        """Tạo các gợi ý câu hỏi tiếp theo"""
        suggestions = []
        
        if next_question:
            # Gợi ý dựa trên câu hỏi hiện tại
            if next_question["key"] == "linh_vuc":
                suggestions = [
                    "Web Development",
                    "Machine Learning",
                    "Blockchain",
                    "Security"
                ]
            elif next_question["key"] == "trinh_do":
                suggestions = [
                    "Mới bắt đầu",
                    "Có kiến thức cơ bản",
                    "Trung bình",
                    "Nâng cao"
                ]
            elif next_question["key"] == "thoi_gian":
                suggestions = [
                    "Buổi tối",
                    "Cuối tuần",
                    "Buổi sáng",
                    "Buổi chiều"
                ]
            elif next_question["key"] == "hinh_thuc":
                suggestions = [
                    "Online",
                    "Offline"
                ]
            else:
                suggestions = ["Có", "Không", "Tôi không chắc"]
        elif matched_tutors:
            suggestions = [
                "Xem thông tin chi tiết",
                "Tôi muốn đăng ký buổi tư vấn",
                "Tìm tutor khác",
                "Cảm ơn bạn"
            ]
        else:
            suggestions = [
                "Tôi muốn học về Web Development",
                "Tôi cần hỗ trợ về Machine Learning",
                "Tôi quan tâm đến Blockchain",
                "Tôi muốn học về Security"
            ]
        
        return suggestions

    def get_conversation(self, conversation_id: str) -> Optional[Dict]:
        """Lấy thông tin conversation"""
        return fake_conversations_db.get(conversation_id)

    def get_user_conversations(self, user_id: str) -> List[Dict]:
        """Lấy tất cả conversations của user"""
        return [
            conv for conv in fake_conversations_db.values()
            if conv.get("user_id") == user_id
        ]
