"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Leaf, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Message {
    id: number;
    text: string;
    sender: "bot" | "user";
    timestamp: Date;
    links?: { text: string; href: string }[];
    quickReplies?: string[];
}

const QUICK_REPLIES = [
    "What are carbon credits?",
    "How do I buy credits?",
    "Calculate my footprint",
    "View projects",
    "Contact support",
];

const BOT_RESPONSES: Record<string, { text: string; links?: { text: string; href: string }[]; quickReplies?: string[] }> = {
    // Greetings
    "hello": {
        text: "Hello! 👋 Welcome to CarbonMarket! I'm your eco-assistant. How can I help you today?",
        quickReplies: ["What are carbon credits?", "How do I buy credits?", "Calculate my footprint"],
    },
    "hi": {
        text: "Hi there! 🌱 I'm here to help you with carbon credits and sustainability. What would you like to know?",
        quickReplies: ["What are carbon credits?", "View projects", "How it works"],
    },
    "hey": {
        text: "Hey! 👋 Welcome to CarbonMarket. I can help you offset your carbon footprint. What brings you here today?",
        quickReplies: ["What are carbon credits?", "How do I buy credits?", "Calculate my footprint"],
    },

    // Carbon Credits Info
    "what are carbon credits": {
        text: "🌍 **Carbon credits** are certificates representing the reduction of one metric ton of CO₂ emissions. When you purchase carbon credits, you're funding projects that reduce greenhouse gases - like reforestation, renewable energy, or direct air capture. Each credit offsets 1 ton of CO₂!",
        links: [{ text: "Browse Projects", href: "/projects" }],
        quickReplies: ["How do I buy credits?", "Types of projects", "Are they verified?"],
    },
    "carbon credit": {
        text: "🌍 **Carbon credits** represent 1 metric ton of CO₂ removed or prevented from entering the atmosphere. By purchasing credits, you support verified environmental projects worldwide!",
        links: [{ text: "Explore Projects", href: "/projects" }],
        quickReplies: ["How do I buy credits?", "View projects", "Calculate my footprint"],
    },

    // How to Buy
    "how do i buy credits": {
        text: "🛒 Buying carbon credits is easy!\n\n1️⃣ Browse our verified projects\n2️⃣ Select credits to add to cart\n3️⃣ Complete checkout\n4️⃣ Receive your certificate!\n\nAll our projects are third-party verified and tracked on blockchain.",
        links: [
            { text: "Browse Projects", href: "/projects" },
            { text: "View Cart", href: "/cart" },
        ],
        quickReplies: ["View projects", "What payment methods?", "How much do they cost?"],
    },
    "buy": {
        text: "Ready to offset your footprint? 🌱 Browse our verified projects and add credits to your cart. We accept all major payment methods!",
        links: [{ text: "Browse Projects", href: "/projects" }],
        quickReplies: ["View projects", "Calculate my footprint", "Pricing info"],
    },
    "purchase": {
        text: "To purchase carbon credits, simply browse our projects, select the quantity you need, and checkout. You'll receive a certificate for your offset! 🎉",
        links: [{ text: "Start Shopping", href: "/projects" }],
        quickReplies: ["View projects", "How much do I need?", "Payment methods"],
    },

    // Calculator
    "calculate my footprint": {
        text: "🧮 Our Carbon Calculator helps you estimate your annual CO₂ emissions based on your lifestyle - home energy, transportation, diet, and more. It's a great starting point to understand your impact!",
        links: [{ text: "Open Calculator", href: "/calculator" }],
        quickReplies: ["How accurate is it?", "How do I reduce emissions?", "Buy credits"],
    },
    "calculator": {
        text: "📊 Use our Carbon Calculator to estimate your environmental impact! Enter details about your lifestyle and we'll show you how many credits you need to become carbon neutral.",
        links: [{ text: "Calculate Now", href: "/calculator" }],
        quickReplies: ["What factors are included?", "View projects", "How to reduce footprint"],
    },
    "footprint": {
        text: "Your carbon footprint is the total greenhouse gases you produce. The average person creates about 4-16 tons of CO₂ per year depending on lifestyle. Let's calculate yours!",
        links: [{ text: "Calculate Footprint", href: "/calculator" }],
        quickReplies: ["How to reduce it?", "Buy credits", "Average footprint"],
    },

    // Projects
    "view projects": {
        text: "🌳 We have verified projects across multiple categories:\n\n• 🌲 Forestry & Conservation\n• 🌊 Ocean & Marine\n• ☀️ Renewable Energy\n• 🏭 Direct Air Capture\n• 🌾 Agriculture\n\nAll projects are verified by standards like Verra and Gold Standard.",
        links: [{ text: "Browse All Projects", href: "/projects" }],
        quickReplies: ["Forestry projects", "Cheapest projects", "Highest rated"],
    },
    "projects": {
        text: "We offer carbon credits from verified projects worldwide! From Amazon Rainforest conservation to Norwegian Direct Air Capture technology. 🌍",
        links: [{ text: "View All Projects", href: "/projects" }],
        quickReplies: ["What types available?", "How are they verified?", "Price range"],
    },
    "types of projects": {
        text: "📋 Our project categories include:\n\n🌲 **Forestry** - Reforestation & conservation\n🌊 **Blue Carbon** - Mangroves & ocean projects\n☀️ **Renewable Energy** - Solar & wind farms\n🏭 **Technology** - Direct air capture\n🌾 **Agriculture** - Sustainable farming\n⚡ **Energy Efficiency** - Reducing waste",
        links: [{ text: "Explore Projects", href: "/projects" }],
        quickReplies: ["View projects", "Which is best?", "Cheapest option"],
    },

    // Verification
    "are they verified": {
        text: "✅ **Yes, absolutely!** All our projects are verified by internationally recognized standards:\n\n• Verra (VCS)\n• Gold Standard\n• American Carbon Registry\n• Climate Action Reserve\n\nWe also use blockchain for transparent tracking.",
        quickReplies: ["What is Verra?", "View projects", "How it works"],
    },
    "verified": {
        text: "🔒 All CarbonMarket projects undergo rigorous third-party verification. We only list projects certified by Verra, Gold Standard, or equivalent bodies. Each credit is tracked to prevent double-counting.",
        quickReplies: ["View verified projects", "Learn more", "Buy credits"],
    },

    // Pricing
    "how much do they cost": {
        text: "💰 Carbon credit prices vary by project type:\n\n• Forestry: $15-25/credit\n• Blue Carbon: $20-30/credit\n• Renewable Energy: $12-20/credit\n• Direct Air Capture: $200-300/credit\n\nPrices reflect the impact and verification level.",
        links: [{ text: "View All Prices", href: "/projects" }],
        quickReplies: ["Why the price difference?", "Cheapest options", "Best value"],
    },
    "price": {
        text: "Our carbon credits range from $12 to $250+ depending on the project type. Forestry projects are most affordable, while cutting-edge Direct Air Capture is premium-priced. 💵",
        links: [{ text: "Compare Prices", href: "/projects" }],
        quickReplies: ["View projects", "Why different prices?", "Best value"],
    },
    "cost": {
        text: "Carbon credit prices vary based on project type, location, and verification standard. Browse our projects to find options that fit your budget! 🌱",
        links: [{ text: "See Pricing", href: "/projects" }],
        quickReplies: ["Cheapest projects", "Premium projects", "How many do I need"],
    },

    // Payment
    "what payment methods": {
        text: "💳 We accept:\n\n• Credit/Debit Cards (Visa, Mastercard, Amex)\n• PayPal\n• Bank Transfer\n• Crypto (BTC, ETH)\n\nAll transactions are secure and encrypted.",
        quickReplies: ["Buy credits", "Is it secure?", "Refund policy"],
    },
    "payment": {
        text: "We accept all major credit cards, PayPal, bank transfers, and cryptocurrency. Your payment is 100% secure! 🔐",
        quickReplies: ["Buy now", "View projects", "Security info"],
    },

    // Account
    "create account": {
        text: "📝 Creating an account is free and takes 30 seconds! With an account you can:\n\n• Track your offsets\n• Download certificates\n• View purchase history\n• Manage your portfolio",
        links: [{ text: "Sign Up", href: "/auth/register" }],
        quickReplies: ["Benefits of account", "Login", "Buy as guest"],
    },
    "login": {
        text: "🔑 Already have an account? Log in to access your portfolio, certificates, and purchase history!",
        links: [
            { text: "Login", href: "/auth/login" },
            { text: "Sign Up", href: "/auth/register" },
        ],
        quickReplies: ["Forgot password", "Create account", "View projects"],
    },
    "register": {
        text: "Join CarbonMarket today! Create your free account to start offsetting your carbon footprint and track your environmental impact. 🌍",
        links: [{ text: "Create Account", href: "/auth/register" }],
        quickReplies: ["Login instead", "Benefits", "Browse first"],
    },

    // Support
    "contact support": {
        text: "📧 Need help? You can reach us at:\n\n• Email: support@carbonmarket.com\n• Hours: Mon-Fri, 9AM-6PM EST\n\nOr ask me your question and I'll try to help!",
        quickReplies: ["Refund policy", "Technical issue", "Partnership inquiry"],
    },
    "help": {
        text: "I'm here to help! 🤝 What do you need assistance with?",
        quickReplies: ["How to buy", "Account issues", "Project info", "Contact support"],
    },
    "support": {
        text: "Our support team is happy to help! Email us at support@carbonmarket.com or let me know what you need. 💬",
        quickReplies: ["Buying help", "Technical issue", "Refund request"],
    },

    // Map
    "map": {
        text: "🗺️ Our interactive map shows all project locations worldwide! See exactly where your carbon credits are making an impact.",
        links: [{ text: "View Map", href: "/map" }],
        quickReplies: ["View projects", "Project locations", "How it works"],
    },

    // Seller
    "sell credits": {
        text: "🏢 Want to sell carbon credits? If you manage a verified carbon offset project, you can list it on CarbonMarket!\n\nRequirements:\n• Third-party verification\n• Documented methodology\n• Monitoring & reporting plan",
        links: [{ text: "Seller Dashboard", href: "/seller" }],
        quickReplies: ["Verification process", "Commission rates", "Contact sales"],
    },
    "become a seller": {
        text: "Interested in selling carbon credits? Register as a seller and list your verified projects on our marketplace! 🌱",
        links: [{ text: "Seller Info", href: "/seller" }],
        quickReplies: ["Requirements", "How to start", "Contact team"],
    },

    // Certificate
    "certificate": {
        text: "🏆 After purchasing carbon credits, you'll receive a digital certificate showing:\n\n• Your offset amount\n• Project details\n• Verification info\n• Unique certificate ID\n\nPerfect for CSR reports and personal records!",
        links: [{ text: "My Portfolio", href: "/portfolio" }],
        quickReplies: ["Buy credits", "View portfolio", "Download certificate"],
    },

    // Environment
    "climate change": {
        text: "🌡️ Climate change is one of humanity's greatest challenges. Carbon credits help by:\n\n• Funding emission reduction projects\n• Supporting clean technology\n• Preserving natural carbon sinks\n• Accelerating the transition to net-zero\n\nEvery credit makes a difference!",
        quickReplies: ["How can I help?", "Calculate footprint", "View projects"],
    },
    "environment": {
        text: "🌍 Protecting our environment is crucial! Carbon credits fund real projects that reduce greenhouse gases and protect ecosystems. Join millions making a positive impact!",
        quickReplies: ["Learn more", "Take action", "View projects"],
    },

    // Thanks
    "thank you": {
        text: "You're welcome! 🌱 Thank you for caring about our planet. Every action counts in fighting climate change!",
        quickReplies: ["Buy credits", "Learn more", "View projects"],
    },
    "thanks": {
        text: "Happy to help! 🌿 Let me know if you need anything else.",
        quickReplies: ["View projects", "Calculate footprint", "Contact support"],
    },

    // Goodbye
    "bye": {
        text: "Goodbye! 👋 Thank you for visiting CarbonMarket. Remember, every offset matters! 🌍💚",
        quickReplies: ["Start over", "View projects"],
    },
    "goodbye": {
        text: "Take care! 🌱 Come back anytime you need help with carbon credits. Together we can make a difference!",
        quickReplies: ["Start over", "View projects"],
    },

    // How it works
    "how it works": {
        text: "📚 **How CarbonMarket Works:**\n\n1️⃣ **Calculate** - Estimate your carbon footprint\n2️⃣ **Browse** - Explore verified offset projects\n3️⃣ **Purchase** - Buy credits to offset emissions\n4️⃣ **Track** - Monitor your impact in your portfolio\n5️⃣ **Certificate** - Receive proof of your offset\n\nIt's that simple!",
        links: [{ text: "Get Started", href: "/calculator" }],
        quickReplies: ["Calculate footprint", "View projects", "Create account"],
    },
};

const DEFAULT_RESPONSE = {
    text: "I'm not sure about that, but I'd be happy to help with:\n\n• Carbon credits info\n• How to buy credits\n• Calculating your footprint\n• Project information\n• Account help\n\nOr you can contact our support team!",
    quickReplies: ["What are carbon credits?", "How do I buy credits?", "Contact support"],
};

function findBestResponse(input: string): { text: string; links?: { text: string; href: string }[]; quickReplies?: string[] } {
    const normalizedInput = input.toLowerCase().trim();

    // Direct match
    if (BOT_RESPONSES[normalizedInput]) {
        return BOT_RESPONSES[normalizedInput];
    }

    // Partial match - check if any keyword is in the input
    for (const [key, response] of Object.entries(BOT_RESPONSES)) {
        const keywords = key.split(" ");
        const matchCount = keywords.filter(keyword => normalizedInput.includes(keyword)).length;
        if (matchCount >= Math.ceil(keywords.length * 0.6)) {
            return response;
        }
    }

    // Check for single keyword matches
    const singleKeywords: Record<string, string> = {
        "credit": "what are carbon credits",
        "buy": "how do i buy credits",
        "purchase": "purchase",
        "calc": "calculator",
        "project": "projects",
        "price": "price",
        "cost": "cost",
        "pay": "payment",
        "verify": "verified",
        "certif": "certificate",
        "help": "help",
        "support": "support",
        "account": "create account",
        "login": "login",
        "register": "register",
        "sign": "register",
        "map": "map",
        "sell": "sell credits",
        "climate": "climate change",
        "environment": "environment",
        "foot": "footprint",
        "work": "how it works",
        "hello": "hello",
        "hi": "hi",
        "hey": "hey",
        "thank": "thank you",
        "bye": "bye",
    };

    for (const [keyword, responseKey] of Object.entries(singleKeywords)) {
        if (normalizedInput.includes(keyword)) {
            return BOT_RESPONSES[responseKey] || DEFAULT_RESPONSE;
        }
    }

    return DEFAULT_RESPONSE;
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [showInitialAnimation, setShowInitialAnimation] = useState(true);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! 👋 I'm your CarbonMarket assistant. I can help you with:\n\n• Carbon credits info\n• Buying & pricing\n• Project details\n• Calculator help\n\nHow can I assist you today?",
            sender: "bot",
            timestamp: new Date(),
            quickReplies: QUICK_REPLIES,
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Stop the initial animation after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowInitialAnimation(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = (text?: string) => {
        const messageText = text || inputValue.trim();
        if (!messageText) return;

        // Add user message
        const userMessage: Message = {
            id: messages.length + 1,
            text: messageText,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        // Simulate typing delay
        setTimeout(() => {
            const response = findBestResponse(messageText);
            const botMessage: Message = {
                id: messages.length + 2,
                text: response.text,
                sender: "bot",
                timestamp: new Date(),
                links: response.links,
                quickReplies: response.quickReplies,
            };

            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
        }, 500 + Math.random() * 500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatMessageText = (text: string) => {
        // Convert markdown-style bold to actual bold
        return text.split("\n").map((line, i) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <span key={i}>
                    {parts.map((part, j) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                            return <strong key={j}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                    {i < text.split("\n").length - 1 && <br />}
                </span>
            );
        });
    };

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isOpen
                        ? "bg-gray-600 hover:bg-gray-700"
                        : `bg-green-600 hover:bg-green-700 hover:scale-110 ${showInitialAnimation ? "animate-bounce" : ""}`
                    }`}
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Leaf className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">CarbonMarket Assistant</h3>
                                <p className="text-xs text-green-100 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                                    Online - Ready to help
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <ChevronDown className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px] min-h-[300px] bg-gray-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`flex gap-2 max-w-[85%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${message.sender === "user"
                                                ? "bg-blue-500"
                                                : "bg-gradient-to-br from-green-500 to-emerald-600"
                                            }`}
                                    >
                                        {message.sender === "user" ? (
                                            <User className="w-4 h-4 text-white" />
                                        ) : (
                                            <Bot className="w-4 h-4 text-white" />
                                        )}
                                    </div>

                                    {/* Message Content */}
                                    <div>
                                        <div
                                            className={`rounded-2xl px-4 py-2.5 ${message.sender === "user"
                                                    ? "bg-blue-500 text-white rounded-tr-sm"
                                                    : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm"
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                                {formatMessageText(message.text)}
                                            </p>
                                        </div>

                                        {/* Links */}
                                        {message.links && message.links.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {message.links.map((link, i) => (
                                                    <Link
                                                        key={i}
                                                        href={link.href}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full hover:bg-green-100 transition-colors border border-green-200"
                                                    >
                                                        {link.text} →
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {/* Quick Replies */}
                                        {message.quickReplies && message.quickReplies.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {message.quickReplies.map((reply, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleSend(reply)}
                                                        className="px-3 py-1.5 bg-white text-gray-700 text-xs rounded-full hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
                                                    >
                                                        {reply}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Timestamp */}
                                        <p
                                            className={`text-[10px] mt-1 ${message.sender === "user" ? "text-right text-gray-400" : "text-gray-400"
                                                }`}
                                        >
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                            />
                            <Button
                                onClick={() => handleSend()}
                                disabled={!inputValue.trim()}
                                className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed p-0"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center mt-2">
                            Powered by CarbonMarket AI • 🌱 Go Green!
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
