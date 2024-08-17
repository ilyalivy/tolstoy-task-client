import React, { useState } from 'react';
import axios from 'axios';

const MultiURLForm = () => {
    const [urls, setUrls] = useState(['', '', '']);
    const [error, setError] = useState('');
    const [metadata, setMetadata] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (index, value) => {
        const updatedUrls = [...urls];
        updatedUrls[index] = value;
        setUrls(updatedUrls);
    };

    const handleAddURL = () => {
        setUrls([...urls, '']);
    };

    const handleRemoveURL = (index) => {
        if (urls.length > 3) {
            const updatedUrls = urls.filter((_, i) => i !== index);
            setUrls(updatedUrls);
        } else {
            setError('You must have at least 3 URLs.');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const validUrls = urls.filter((url) => url.trim() !== '');

        if (validUrls.length < 3) {
            setError('Please enter at least 3 URLs.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            validUrls.forEach((url) => new URL(url));

            console.log('ValidUrls', validUrls);

            const response = await axios.post(
                'http://localhost:3001/fetch-metadata',
                {
                    urls: validUrls,
                }
            );

            const fetchedMetadata = response.data.map((metadata, index) => ({
                url: validUrls[index],
                ...metadata,
                error: metadata.error || null,
            }));

            setMetadata(fetchedMetadata);
        } catch (error) {
            setMetadata(
                validUrls.map((url) => ({
                    url,
                    title: 'Failed to fetch metadata',
                    description: '',
                    image: null,
                    error: error.message,
                }))
            );
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col gap-2 w-full justify-center items-center mt-4">
            <div className="text-[24px] font-bold flex flex-col">
                Tolstoy home task
            </div>
            <form onSubmit={handleSubmit}>
                <h3>Please enter URLs to get meta data:</h3>
                {urls.map((url, index) => (
                    <div key={index} className="mt-4 relative">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) =>
                                handleInputChange(index, e.target.value)
                            }
                            placeholder={`URL ${index + 1}`}
                            required
                            className="w-[500px] p-2 border border-gray-200 rounded-md shadow-md"
                        />
                        {urls.length > 3 && index >= 3 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveURL(index)}
                                className="absolute bg-red-500 text-white font-bold px-4 py-2 rounded-md ml-4"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <div className="flex w-full mt-6 items-center gap-4">
                    <button
                        type="button"
                        onClick={handleAddURL}
                        className="bg-blue-500 text-white font-bold px-4 py-2 rounded-md"
                    >
                        Add another URL
                    </button>
                    {error && <p>{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-500 text-white font-bold px-4 py-2 rounded-md"
                    >
                        {loading ? 'Fetching...' : 'Submit'}
                    </button>
                </div>
            </form>
            {metadata.length > 0 && (
                <div className="mx-12 mt-4">
                    <h3 className="text-[16px] font-bold my-8 text-center">
                        Fetched Metadata:
                    </h3>
                    <div className="flex items-center justify-center flex-wrap w-full gap-20">
                        {metadata.map((data, index) => (
                            <div key={index}>
                                {data.error ? (
                                    <div>
                                        <p>
                                            <strong>
                                                Error fetching data for:
                                            </strong>{' '}
                                            {data.url}
                                        </p>
                                        <p>{data.error}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4 w-[300px] h-[300px] rounded-md border border-gray-200 shadow-md px-8 py-4">
                                        <h4>{data.title}</h4>
                                        {data.image && (
                                            <img
                                                className="w-[100px]"
                                                src={data.image}
                                                alt={data.title}
                                            />
                                        )}
                                        <p>{data.description}</p>
                                        <a
                                            href={data.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Visit Site
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiURLForm;
