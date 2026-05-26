import { useState, useEffect } from "react";
import { Card, FormField, Loader } from "../components";
import { API_BASE_URL, readJsonResponse } from "../api";

const descriptions = {
  english: {
    title: "Gallery of AI-Generated Imagery",
    description:
      "Explore a collection of images produced by our cutting-edge AI model, transforming text descriptions into visual masterpieces.",
  },
  hebrew: {
    title: "גלריה של תמונות שנוצרו באמצעות בינה מלאכותית על ידי משתמשים קודמים",
    description:
      "חקרו אוסף של תמונות שנוצרו על ידי מודל הבינה המלאכותית שלנו, שמשנה תיאורים טקסטואליים ליצירות אמנות ויזואליות.",
  },
  arabic: {
    title: "معرض الصور التي تم إنشاؤها بواسطة الذكاء الاصطناعي",
    description:
      "استكشف مجموعة من الصور التي أنتجها نموذج الذكاء الاصطناعي المتطور لدينا، والذي يحول الأوصاف النصية إلى تحف فنية بصرية.",
  },
};

const RenderCards = ({ data, title }) => {
  if (data?.length > 0) {
    return data.map((post) => <Card key={post._id} {...post} />);
  }
  return (
    <h2 className="mt-5 font-bold text-[#6469ff] text-xl uppercase">{title}</h2>
  );
};

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchedResults, setSearchedResults] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/post`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await readJsonResponse(response);
      if (response.ok) {
        setAllPosts((result.data || []).slice(0, 100));
      } else {
        throw new Error(result.message || "Fetching posts failed");
      }
    } catch (err) {
      console.error(err);
      setAllPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Refresh page every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchPosts(); // fetch the posts again
    }, 30000); // 30000 ms = 30 seconds

    return () => clearInterval(intervalId); // This clears the interval when the component unmounts
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    clearTimeout(searchTimeout);
    setSearchText(value);

    setSearchTimeout(
      setTimeout(() => {
        const searchResult = (allPosts || []).filter(
          (item) =>
            item.name.toLowerCase().includes(value.toLowerCase()) ||
            item.prompt.toLowerCase().includes(value.toLowerCase())
        );
        setSearchedResults(searchResult);
      }, 500)
    );
  };

  return (
    <section className="max-w-7xl mx-auto">
      <div>
        <h1 className="font-extrabold text-[#222328] text-[32px]">
          {descriptions.english.title}
        </h1>
        <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">
          {descriptions.english.description}
        </p>
        <h1 className="font-extrabold text-[#222328] text-[32px]">
          {descriptions.hebrew.title}
        </h1>
        <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">
          {descriptions.hebrew.description}
        </p>
        <h1 className="font-extrabold text-[#222328] text-[32px]">
          {descriptions.arabic.title}
        </h1>
        <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">
          {descriptions.arabic.description}
        </p>
      </div>
      <div className="mt-16">
        <FormField
          labelName="Search posts/חפש תמונות/ابحث عن الصور"
          type="text"
          name="text"
          placeholder="search posts/חפש תמונות/ابحث عن الصور"
          value={searchText}
          handleChange={handleSearchChange}
        />
      </div>
      <div className="mt-10">
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <>
            {searchText && (
              <h2 className="font-medium text-[#666e75] text-xl mb-3">
                Showing Results for{" "}
                <span className="text-[#222328]">{searchText}</span>:
              </h2>
            )}
            <div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-3">
              {searchText ? (
                <RenderCards
                  data={searchedResults}
                  title="No Search Results Found"
                />
              ) : (
                <RenderCards data={allPosts} title="No Posts Yet" />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Home;
