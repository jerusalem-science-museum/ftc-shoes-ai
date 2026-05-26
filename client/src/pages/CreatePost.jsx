import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { preview } from "../assets";
import { getRandomPrompt } from "../utils";
import { FormField, Loader } from "../components";
import { API_BASE_URL, readJsonResponse } from "../api";

const labels = {
  english: "Continue the following prompt - the shoe I'm seeing is ...",
  hebrew: "...המשך את המשפט - הנעל שאני רואה היא",
  arabic: "...استمر في الموجه التالي - الحذاء الذي أراه هو",
};
const placeholders = {
  english: "An Impressionist oil painting of sunflowers in a purple vase…",
  hebrew: "הקלידו תיאור פריט כאן...",
  arabic: "اكتب وصف العنصر هنا...",
};
const descriptions = {
  english: {
    welcome:
      "Welcome to Shoe-Imagine! Ready to see your words come to life?",
    explanation1: "Look at the shoes presented in front of you.",
    explanation2:
      "Use your creativity to describe what you see. Be descriptive!",
    example:
      'For example: "I see shiny red shoes with green laces and yellow stars on them."',
    instruction1: "Type your description into the app.",
    instruction2: 'Tap the "Imagine" button.',
    result:
      "Voila! The AI model behind this app will show you an image of what it thinks the shoes you described look like.",
  },
  hebrew: {
    welcome:
      "ברוכים הבאים לעיצוב נעליים באמצעות בינה מלאכותית! האם אתם מוכנים לראות את המילים שלכם הופכות למציאות?",
    explanation1: "הסתכלו על הנעליים שמוצגות מולכם.",
    explanation2:
      "השתמשו ביצירתיות שלכם כדי לתאר את מה שאתם רואים. היו תיאוריים!",
    example:
      'לדוגמה: "אני רואה נעליים אדומות מבריקות עם שרוכים ירוקים וכוכבים צהובים עליהן."',
    instruction1: "הקלידו את התיאור שלכם לתוך האפליקציה.",
    instruction2: 'לחצו על כפתור "דמיין".',
    result:
      "והנה! הדגם התוכניתי שמאחורי האפליקציה הזו יראה לכם תמונה של מה שהוא חושב שהנעליים שתיארתם נראות.",
  },
  arabic: {
    welcome: "مرحبًا بك في  هل أنت جاهز لرؤية خيالك يتحقق؟",
    explanation1: "ألقِ نظرة على الأحذية المعروضة أمامك.",
    explanation2: "استخدم خيالك لوصف ما تراه. كن وصفيًا!",
    example:
      'على سبيل المثال: "أرى أحذية حمراء لامعة مع أربطة خضراء ونجوم صفراء عليها."',
    instruction1: "اكتب وصفك في التطبيق.",
    instruction2: 'اضغط على زر "تخيل".',
    result:
      "ها هو! سيريك النموذج الذكاء الاصطناعي وراء هذا التطبيق صورة لما يعتقد أن الأحذية التي وصفتها تبدو مثلها.",
  },
};

const CreatePost = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    prompt: "",
    photo: "",
  });
  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("english");
  const [isValidPrompt, setIsValidPrompt] = useState(true);
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyMessage, setApiKeyMessage] = useState("");
  const [savingApiKey, setSavingApiKey] = useState(false);
  const validatePrompt = (prompt) => {
    return prompt.trim().length >= 3;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "prompt") {
      setIsValidPrompt(validatePrompt(e.target.value));
    }
  };

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({ ...form, prompt: randomPrompt });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.prompt && form.photo) {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/post`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...form }),
        });

        const data = await readJsonResponse(response);
        if (!response.ok) {
          throw new Error(data.message || "Sharing failed");
        }

        navigate("/create-post");
        window.location.reload();

        setTimeout(() => {
          navigate("/create-post"); // Immediately navigate back to refresh after a short delay
        }, 100); // adjust the timeout as needed
      } catch (err) {
        alert(err);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please generate an image with proper details");
    }
  };

  const saveApiKey = async () => {
    try {
      setSavingApiKey(true);
      setApiKeyMessage("");

      const response = await fetch(`${API_BASE_URL}/api/config/openai-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await readJsonResponse(response);
      if (!response.ok) {
        throw new Error(data.message || "Could not save API key");
      }

      setApiKey("");
      setShowApiKeyForm(false);
      setApiKeyMessage("API key saved. Try Generate again.");
    } catch (err) {
      setApiKeyMessage(err.message || "Could not save API key.");
    } finally {
      setSavingApiKey(false);
    }
  };

  const generateImage = async () => {
    if (form.prompt && isValidPrompt) {
      try {
        setGeneratingImg(true);
        const response = await fetch(`${API_BASE_URL}/api/v1/dalle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: form.prompt,
          }),
        });

        const data = await readJsonResponse(response);
        if (!response.ok) {
          if (data.needsApiKey) {
            setShowApiKeyForm(true);
            setApiKeyMessage(data.message || "OpenAI API key is required.");
            return;
          }

          throw new Error(data.message || "Image generation failed");
        }

        setApiKeyMessage("");
        setForm({ ...form, photo: `data:image/png;base64,${data.photo}` });
      } catch (err) {
        console.error(err);
        alert(err.message || err);
      } finally {
        setGeneratingImg(false);
      }
    } else {
      alert(
        "Please type a short shoe description.\n" +
          "אנא הקלידו תיאור קצר של הנעל.\n" +
          "يرجى كتابة وصف قصير للحذاء."
      );
    }
  };

  return (
    <section className="max-w-7xl mx-auto">
      <div>
        <button
          onClick={() => setLanguage("english")}
          className="font-semibold text-xs bg-[#EcECF1] py-1 px-2 rounded-[5px] text-black"
        >
          English{" "}
        </button>
        <button
          onClick={() => setLanguage("hebrew")}
          className="font-semibold text-xs bg-[#EcECF1] py-1 px-2 rounded-[5px] text-black"
        >
          Hebrew{" "}
        </button>
        <button
          onClick={() => setLanguage("arabic")}
          className="font-semibold text-xs bg-[#EcECF1] py-1 px-2 rounded-[5px] text-black"
        >
          Arabic{" "}
        </button>
        <h1 className="font-extrabold text-[#222328] text-[32px]">
          {descriptions[language].welcome}
        </h1>
        <div>
          <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">
            {descriptions[language].explanation1}
          </p>
          <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">
            {descriptions[language].explanation2}
          </p>
          <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">
            {descriptions[language].example}
          </p>
          <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">
            {descriptions[language].instruction1}
          </p>
          <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">
            {descriptions[language].instruction2}
          </p>
          <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">
            {descriptions[language].result}
          </p>
        </div>
      </div>
      <form className="mt-16 max-w-3xl" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5">
          <FormField
            labelName="Your Name/השם שלך"
            type="text"
            name="name"
            placeholder="Ex., John Doe/ לדוגמא-אמיר כהן"
            value={form.name}
            handleChange={handleChange}
          />
          <FormField
            labelName={labels[language]}
            type="text"
            name="prompt"
            placeholder={placeholders[language]}
            value={form.prompt}
            handleChange={handleChange}
            isSurpriseMe
            handleSurpriseMe={handleSurpriseMe}
          />

          <div className="relative bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 p-3 h-64 flex justify-center items-center">
            {form.photo ? (
              <img
                src={form.photo}
                alt={form.prompt}
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={preview}
                alt="preview"
                className="w-9/12 h-9/12 object-contain opacity-40"
              />
            )}
            {generatingImg && (
              <div className="absolute inset-0 z-0 flex justify-center items-center bg-[rgba(0,0,0,0.5)] rounded-lg">
                <Loader />
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 flex gap-5">
          <button
            type="button"
            onClick={generateImage}
            className=" text-white bg-green-700 font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {generatingImg ? "Generating..." : "Generate"}
          </button>
        </div>
        {(showApiKeyForm || apiKeyMessage) && (
          <div className="mt-5 max-w-xl rounded-md border border-gray-300 bg-white p-4">
            {apiKeyMessage && (
              <p className="text-sm text-[#222328]">{apiKeyMessage}</p>
            )}
            {showApiKeyForm && (
              <div className="mt-3 flex flex-col gap-3">
                <label
                  htmlFor="openai-api-key"
                  className="block text-sm font-medium text-gray-900"
                >
                  OpenAI API key
                </label>
                <input
                  id="openai-api-key"
                  type="password"
                  autoComplete="off"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#6469ff] focus:border-[#6469ff] outline-none block w-full p-3"
                />
                <button
                  type="button"
                  onClick={saveApiKey}
                  disabled={savingApiKey || !apiKey.trim()}
                  className="text-white bg-[#6469ff] disabled:bg-gray-400 font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                >
                  {savingApiKey ? "Saving..." : "Save API key"}
                </button>
              </div>
            )}
          </div>
        )}
        <div className="mt-10">
          <p className="mt-2 text-[#666e75] text-[14px]">
            Once youve generated an image of the shoe you can share it on the
            window above!
          </p>
          <button
            type="submit"
            className="mt-3 text-white bg-[#6469ff] font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {loading ? "Sharing..." : "Shared, check out the above window! "}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreatePost;
