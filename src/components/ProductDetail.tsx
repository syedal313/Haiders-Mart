import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images: string[];
  image: string;
  description: string;
  rating: number;
  reviews?: { name: string; rating: number; comment: string }[];
}

/* ─── Win2K Design Tokens ──────────────────────────────────────────── */
const W = {
  // colours
  silver: '#c0c0c0',
  lightGray: '#d4d0c8',
  darkGray: '#808080',
  white: '#ffffff',
  black: '#000000',
  winBlue: '#000080',
  winBlueBright: '#1084d0',
  cyan: '#008080',
  btnFace: '#ece9d8',
  btnShadow: '#aca899',
  btnHilight: '#ffffff',
  btnDkShadow: '#716f64',
  text: '#000000',
  link: '#0000ee',
  visited: '#551a8b',
  titleBarGrad1: '#0a246a',
  titleBarGrad2: '#a6caf0',
  inactiveTitleBar: '#7a96df',
  errorRed: '#cc0000',
  successGreen: '#007700',
} as const;

/* ─── Helpers ──────────────────────────────────────────────────────── */
const bevel = (raised = true) =>
  raised
    ? `2px solid ${W.btnHilight} inset, -2px -2px 0 ${W.btnDkShadow} inset, 1px 1px 0 ${W.btnShadow} inset`
    : `2px solid ${W.btnDkShadow} inset, -2px -2px 0 ${W.btnHilight} inset, 1px 1px 0 ${W.silver} inset`;

/* ─── Sub-components ───────────────────────────────────────────────── */

function TitleBar({ title }: { title: string }) {
  return (
    <div
      style={{
        background: `linear-gradient(to right, ${W.titleBarGrad1}, ${W.titleBarGrad2})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '3px 4px',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <img
          src="https://win98icons.alexmeub.com/icons/png/ie_small-4.png"
          alt=""
          style={{ width: 16, height: 16, imageRendering: 'pixelated' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span style={{ color: W.white, fontSize: 12, fontFamily: 'Tahoma, sans-serif', fontWeight: 'bold' }}>
          {title}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        {['_', '□', '✕'].map((ch, i) => (
          <button
            key={i}
            style={{
              width: 16, height: 14,
              background: W.btnFace,
              border: 'none',
              boxShadow: bevel(true),
              fontSize: 9,
              fontFamily: 'Marlett, Arial, sans-serif',
              cursor: 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: W.black,
            }}
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
}

function Win2KButton({
  children,
  onClick,
  style = {},
  type = 'button',
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type={type}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onClick}
      style={{
        background: W.btnFace,
        border: 'none',
        boxShadow: bevel(!pressed),
        padding: '3px 10px',
        fontFamily: 'Tahoma, Arial, sans-serif',
        fontSize: 11,
        cursor: disabled ? 'not-allowed' : 'default',
        color: disabled ? W.darkGray : W.black,
        minWidth: 75,
        minHeight: 23,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Win2KInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  rows,
  required,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  rows?: number;
  required?: boolean;
}) {
  const baseStyle: React.CSSProperties = {
    background: W.white,
    border: `2px solid ${W.btnDkShadow}`,
    boxShadow: `1px 1px 0 ${W.black} inset`,
    padding: '2px 4px',
    fontFamily: 'Tahoma, Arial, sans-serif',
    fontSize: 11,
    color: W.black,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };
  return rows ? (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      required={required}
      style={{ ...baseStyle, resize: 'vertical' }}
    />
  ) : (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={baseStyle}
    />
  );
}

function GroupBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset
      style={{
        border: `2px solid ${W.btnShadow}`,
        boxShadow: `1px 1px 0 ${W.btnHilight}`,
        padding: '8px 12px 12px',
        marginBottom: 12,
        background: W.btnFace,
      }}
    >
      <legend
        style={{
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: 11,
          fontWeight: 'bold',
          color: W.black,
          padding: '0 4px',
        }}
      >
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function StatusBar({ text }: { text: string }) {
  return (
    <div
      style={{
        background: W.btnFace,
        borderTop: `1px solid ${W.btnShadow}`,
        display: 'flex',
        alignItems: 'center',
        padding: '1px 4px',
        gap: 4,
      }}
    >
      <div
        style={{
          flex: 1,
          border: `1px solid ${W.btnShadow}`,
          boxShadow: `1px 1px 0 ${W.btnHilight}`,
          padding: '0 4px',
          fontSize: 10,
          fontFamily: 'Tahoma, Arial, sans-serif',
          color: W.black,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {text}
      </div>
      <div
        style={{
          width: 80,
          border: `1px solid ${W.btnShadow}`,
          boxShadow: `1px 1px 0 ${W.btnHilight}`,
          padding: '0 4px',
          fontSize: 10,
          fontFamily: 'Tahoma, Arial, sans-serif',
          color: W.black,
          height: 17,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
        }}
      >
        <span>🌐</span> Internet
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────── */
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const addToCart = useStore((state) => state.addToCart);

  // Review state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [statusText, setStatusText] = useState('Ready');
  const [wishlistMsg, setWishlistMsg] = useState('');

  useEffect(() => {
    setStatusText('Connecting to product server...');
    fetch('/api/products')
      .then(res => res.json())
      .then((data: Product[]) => {
        const found = data.find(p => p.id === id);
        if (found) {
          const gallery = found.images && found.images.length > 0
            ? found.images
            : [found.image, found.image, found.image];
          setProduct({ ...found, images: gallery });
          setStatusText('Done');
        } else {
          setStatusText('Error: Product not found');
        }
      })
      .catch(() => setStatusText('Error: Could not connect to server'));
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRating) { alert('Please select a rating'); return; }
    try {
      setStatusText('Submitting review...');
      const res = await fetch(`/api/products/${product?.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reviewName, rating: reviewRating, comment: reviewComment }),
      });
      if (res.ok) {
        alert('Review submitted!');
        const refreshed = await fetch(`/api/products/${product?.id}`).then(r => r.json());
        setProduct(refreshed);
        setReviewName(''); setReviewRating(0); setReviewComment('');
        setStatusText('Review posted successfully.');
      }
    } catch (err) {
      console.error(err);
      setStatusText('Error submitting review.');
    }
  };

  if (!product) {
    return (
      <div style={{ background: '#3a6ea5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: W.btnFace, border: `2px solid ${W.btnDkShadow}`, boxShadow: bevel(true), padding: 24, textAlign: 'center' }}>
          <img src="https://win98icons.alexmeub.com/icons/png/hourglass-0.png" alt="Loading" style={{ width: 32, height: 32, imageRendering: 'pixelated', marginBottom: 8 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <p style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 12 }}>Loading product data, please wait...</p>
        </div>
      </div>
    );
  }

  const starDisplay = (count: number, filled: boolean) => (filled ? '★' : '☆').repeat(count === 5 ? 5 : count);

  return (
    <div
      style={{
        background: '#3a6ea5',
        minHeight: '100vh',
        padding: '24px 16px',
        fontFamily: 'Tahoma, Arial, sans-serif',
      }}
    >
      {/* ── Marquee Banner ── */}
      <div
        style={{
          background: W.winBlue,
          color: W.white,
          padding: '2px 0',
          marginBottom: 8,
          overflow: 'hidden',
        }}
      >
        <marquee style={{ fontSize: 11, fontFamily: 'Tahoma, Arial, sans-serif' }}>
          🛒 Welcome to Haiders Mart Online Shopping Portal v2.0 &nbsp;|&nbsp; FREE DELIVERY on orders over Rs. 2,000 &nbsp;|&nbsp; SECURE ONLINE SHOPPING &nbsp;|&nbsp; 128-bit SSL Encrypted &nbsp;|&nbsp; Best Prices Guaranteed!!! &nbsp;|&nbsp; 🌟 NEW ARRIVALS DAILY 🌟
        </marquee>
      </div>

      {/* ── Main Window ── */}
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          background: W.btnFace,
          border: `2px solid ${W.btnDkShadow}`,
          boxShadow: bevel(true),
        }}
      >
        <TitleBar title={`${product.name} - Haiders Mart Shopping Center`} />

        {/* Menu Bar */}
        <div
          style={{
            background: W.btnFace,
            borderBottom: `1px solid ${W.btnShadow}`,
            display: 'flex',
            gap: 0,
            padding: '2px 4px',
          }}
        >
          {['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'].map(m => (
            <button
              key={m}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '2px 6px',
                fontSize: 11,
                fontFamily: 'Tahoma, Arial, sans-serif',
                cursor: 'default',
                color: W.black,
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = W.winBlueBright; (e.target as HTMLElement).style.color = W.white; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = W.black; }}
            >
              <u>{m[0]}</u>{m.slice(1)}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div
          style={{
            background: W.btnFace,
            borderBottom: `1px solid ${W.btnShadow}`,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 6px',
          }}
        >
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Win2KButton style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              ◀ Back
            </Win2KButton>
          </Link>
          <Win2KButton>Forward ▶</Win2KButton>
          <div style={{ width: 1, background: W.btnShadow, height: 20, margin: '0 4px' }} />
          <Win2KButton onClick={() => window.location.reload()}>🔄 Refresh</Win2KButton>
          <Win2KButton>🏠 Home</Win2KButton>
          <div style={{ width: 1, background: W.btnShadow, height: 20, margin: '0 4px' }} />
          <Win2KButton onClick={() => { addToCart(product); setStatusText(`"${product.name}" added to cart`); }}>
            🛒 Add to Cart
          </Win2KButton>
          <Win2KButton
            onClick={() => {
              setWishlistMsg('Added to Favorites!');
              setStatusText(`"${product.name}" added to Favorites`);
              setTimeout(() => setWishlistMsg(''), 2000);
            }}
          >
            ❤️ Favorites
          </Win2KButton>
        </div>

        {/* Address Bar */}
        <div
          style={{
            background: W.btnFace,
            borderBottom: `1px solid ${W.btnShadow}`,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 6px',
          }}
        >
          <span style={{ fontSize: 11, color: W.black, whiteSpace: 'nowrap' }}>Address:</span>
          <div
            style={{
              flex: 1,
              background: W.white,
              border: `2px solid ${W.btnDkShadow}`,
              boxShadow: `1px 1px 0 ${W.black} inset`,
              padding: '1px 4px',
              fontSize: 11,
              color: W.winBlue,
              fontFamily: 'Tahoma, Arial, sans-serif',
              height: 20,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            🌐 http://www.haidersmart.com/shop/product/{product.id}
          </div>
          <Win2KButton style={{ minWidth: 40 }}>Go</Win2KButton>
        </div>

        {/* Page content */}
        <div style={{ padding: 12, background: W.white }}>

          {/* Wishlist notification */}
          {wishlistMsg && (
            <div
              style={{
                background: '#ffffe1',
                border: `1px solid ${W.black}`,
                padding: '4px 8px',
                marginBottom: 8,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              ℹ️ {wishlistMsg}
            </div>
          )}

          {/* Sale banner */}
          {product.discountPercentage && (
            <div
              style={{
                background: W.errorRed,
                color: W.white,
                textAlign: 'center',
                padding: '3px 0',
                marginBottom: 10,
                fontSize: 11,
                fontWeight: 'bold',
              }}
            >
              🔥 HOT DEAL! {product.discountPercentage}% OFF — LIMITED TIME OFFER! 🔥
            </div>
          )}

          {/* Main 2-col table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', verticalAlign: 'top' }}>
            <tbody>
              <tr style={{ verticalAlign: 'top' }}>

                {/* LEFT — Image gallery */}
                <td style={{ width: '45%', paddingRight: 12 }}>
                  <GroupBox title="Product Images">
                    {/* Main image */}
                    <div
                      style={{
                        border: `2px solid ${W.btnDkShadow}`,
                        boxShadow: `1px 1px 0 ${W.btnHilight}`,
                        background: W.white,
                        marginBottom: 6,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={product.images[selectedImageIndex]}
                        alt={product.name}
                        style={{
                          width: '100%',
                          aspectRatio: '4/5',
                          objectFit: 'cover',
                          display: 'block',
                          imageRendering: 'auto',
                        }}
                      />
                    </div>

                    {/* Thumbnails */}
                    {product.images.length > 1 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {product.images.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedImageIndex(i)}
                            style={{
                              width: 48, height: 48,
                              border: selectedImageIndex === i
                                ? `3px solid ${W.winBlue}`
                                : `2px solid ${W.btnDkShadow}`,
                              boxShadow: bevel(selectedImageIndex !== i),
                              padding: 0,
                              background: 'none',
                              cursor: 'default',
                              overflow: 'hidden',
                            }}
                          >
                            <img src={img} alt={`View ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Nav buttons */}
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      <Win2KButton
                        onClick={() => setSelectedImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                        style={{ flex: 1 }}
                      >
                        ◀ Previous
                      </Win2KButton>
                      <Win2KButton
                        onClick={() => setSelectedImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                        style={{ flex: 1 }}
                      >
                        Next ▶
                      </Win2KButton>
                    </div>
                  </GroupBox>

                  {/* Secure shopping badge */}
                  <div
                    style={{
                      border: `2px solid ${W.btnDkShadow}`,
                      boxShadow: bevel(true),
                      background: W.btnFace,
                      padding: '6px 8px',
                      fontSize: 10,
                      fontFamily: 'Tahoma, Arial, sans-serif',
                      color: W.black,
                      textAlign: 'center',
                    }}
                  >
                    🔒 128-Bit SSL Secure Shopping<br />
                    <span style={{ color: W.successGreen }}>✓ Verified Merchant</span>
                  </div>
                </td>

                {/* RIGHT — Product info */}
                <td style={{ verticalAlign: 'top' }}>
                  <GroupBox title={`Product Details — ${product.category}`}>

                    {/* Category badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span
                        style={{
                          background: W.winBlue,
                          color: W.white,
                          fontSize: 10,
                          fontWeight: 'bold',
                          padding: '1px 6px',
                          fontFamily: 'Tahoma, Arial, sans-serif',
                          textTransform: 'uppercase',
                        }}
                      >
                        {product.category}
                      </span>
                      <span style={{ fontSize: 11, color: '#cc6600' }}>
                        {[...Array(5)].map((_, k) => (
                          <span key={k} style={{ color: k < Math.round(product.rating) ? '#ff8800' : '#999999' }}>★</span>
                        ))}
                        &nbsp;{product.rating} / 5.0
                      </span>
                    </div>

                    <h1
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        fontFamily: 'Tahoma, Arial, sans-serif',
                        color: W.black,
                        margin: '0 0 8px 0',
                        borderBottom: `1px solid ${W.btnShadow}`,
                        paddingBottom: 6,
                      }}
                    >
                      {product.name}
                    </h1>

                    {/* Price */}
                    <table style={{ marginBottom: 10, borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontSize: 11, color: W.darkGray, paddingRight: 8, fontFamily: 'Tahoma, Arial, sans-serif' }}>Price:</td>
                          <td>
                            <span style={{ fontSize: 20, fontWeight: 'bold', color: W.errorRed, fontFamily: 'Tahoma, Arial, sans-serif' }}>
                              Rs. {product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span style={{ fontSize: 12, color: W.darkGray, textDecoration: 'line-through', marginLeft: 8, fontFamily: 'Tahoma, Arial, sans-serif' }}>
                                Rs. {product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </td>
                        </tr>
                        {product.discountPercentage && (
                          <tr>
                            <td style={{ fontSize: 11, color: W.darkGray, fontFamily: 'Tahoma, Arial, sans-serif' }}>You save:</td>
                            <td style={{ fontSize: 11, color: W.successGreen, fontWeight: 'bold', fontFamily: 'Tahoma, Arial, sans-serif' }}>
                              {product.discountPercentage}% Discount Applied!
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td style={{ fontSize: 11, color: W.darkGray, fontFamily: 'Tahoma, Arial, sans-serif' }}>Shipping:</td>
                          <td style={{ fontSize: 11, color: W.successGreen, fontFamily: 'Tahoma, Arial, sans-serif', fontWeight: 'bold' }}>FREE within Pakistan</td>
                        </tr>
                        <tr>
                          <td style={{ fontSize: 11, color: W.darkGray, fontFamily: 'Tahoma, Arial, sans-serif' }}>Availability:</td>
                          <td style={{ fontSize: 11, color: W.successGreen, fontWeight: 'bold', fontFamily: 'Tahoma, Arial, sans-serif' }}>✓ In Stock</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Description */}
                    <div
                      style={{
                        background: W.white,
                        border: `1px solid ${W.btnShadow}`,
                        boxShadow: `1px 1px 0 ${W.btnHilight}`,
                        padding: '6px 8px',
                        fontSize: 11,
                        color: W.black,
                        lineHeight: 1.5,
                        marginBottom: 10,
                        fontFamily: 'Tahoma, Arial, sans-serif',
                      }}
                    >
                      {product.description}
                    </div>

                    {/* Add to Cart area */}
                    <div
                      style={{
                        background: '#ffffcc',
                        border: `1px solid ${W.black}`,
                        padding: '8px',
                        marginBottom: 8,
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Win2KButton
                        onClick={() => {
                          addToCart(product);
                          setStatusText(`"${product.name}" added to shopping cart`);
                        }}
                        style={{ background: '#ff9900', fontWeight: 'bold', minWidth: 140 }}
                      >
                        🛒 Add to Cart
                      </Win2KButton>
                      <Win2KButton
                        onClick={() => {
                          setWishlistMsg('Item added to Favorites!');
                          setStatusText(`Added "${product.name}" to Favorites`);
                          setTimeout(() => setWishlistMsg(''), 2000);
                        }}
                        style={{ minWidth: 120 }}
                      >
                        ❤️ Add to Wishlist
                      </Win2KButton>
                    </div>

                    {/* Info badges */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 4 }}>
                      <tbody>
                        <tr>
                          {[
                            { icon: '🔒', label: 'Secure Checkout' },
                            { icon: '🚚', label: 'Fast Delivery' },
                            { icon: '↩️', label: 'Easy Returns' },
                          ].map(b => (
                            <td
                              key={b.label}
                              style={{
                                border: `1px solid ${W.btnShadow}`,
                                background: W.btnFace,
                                textAlign: 'center',
                                padding: '4px 2px',
                                fontSize: 9,
                                fontFamily: 'Tahoma, Arial, sans-serif',
                                color: W.black,
                              }}
                            >
                              {b.icon}<br />{b.label}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </GroupBox>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Horizontal divider */}
          <div style={{ borderTop: `2px solid ${W.btnShadow}`, borderBottom: `1px solid ${W.btnHilight}`, margin: '8px 0' }} />

          {/* Bottom row: Write review | Existing reviews */}
          <table style={{ width: '100%', borderCollapse: 'collapse', verticalAlign: 'top' }}>
            <tbody>
              <tr style={{ verticalAlign: 'top' }}>
                {/* Write review */}
                <td style={{ width: '48%', paddingRight: 8 }}>
                  <GroupBox title="Write a Customer Review">
                    <form onSubmit={handleSubmitReview}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td style={{ fontSize: 11, paddingBottom: 4, paddingRight: 6, whiteSpace: 'nowrap', verticalAlign: 'middle', fontFamily: 'Tahoma, Arial, sans-serif' }}>
                              Your Name:
                            </td>
                            <td style={{ paddingBottom: 4 }}>
                              <Win2KInput value={reviewName} onChange={e => setReviewName(e.target.value)} required />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ fontSize: 11, paddingBottom: 4, paddingRight: 6, whiteSpace: 'nowrap', verticalAlign: 'middle', fontFamily: 'Tahoma, Arial, sans-serif' }}>
                              Rating:
                            </td>
                            <td style={{ paddingBottom: 4 }}>
                              <div style={{ display: 'flex', gap: 4 }}>
                                {[1, 2, 3, 4, 5].map(r => (
                                  <button
                                    key={r}
                                    type="button"
                                    onClick={() => setReviewRating(r)}
                                    style={{
                                      fontSize: 18,
                                      cursor: 'default',
                                      background: 'none',
                                      border: 'none',
                                      color: reviewRating >= r ? '#ff8800' : '#cccccc',
                                      padding: 0,
                                      lineHeight: 1,
                                    }}
                                  >
                                    ★
                                  </button>
                                ))}
                                <span style={{ fontSize: 10, alignSelf: 'center', fontFamily: 'Tahoma, Arial, sans-serif', color: W.darkGray }}>
                                  ({reviewRating > 0 ? `${reviewRating}/5` : 'Click to rate'})
                                </span>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ fontSize: 11, paddingBottom: 4, paddingRight: 6, whiteSpace: 'nowrap', verticalAlign: 'top', paddingTop: 2, fontFamily: 'Tahoma, Arial, sans-serif' }}>
                              Comments:
                            </td>
                            <td style={{ paddingBottom: 4 }}>
                              <Win2KInput value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={4} required />
                            </td>
                          </tr>
                          <tr>
                            <td />
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <Win2KButton type="submit" style={{ fontWeight: 'bold' }}>
                                  Submit Review
                                </Win2KButton>
                                <Win2KButton type="button" onClick={() => { setReviewName(''); setReviewRating(0); setReviewComment(''); }}>
                                  Clear
                                </Win2KButton>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </form>
                  </GroupBox>
                </td>

                {/* Existing reviews */}
                <td style={{ verticalAlign: 'top' }}>
                  <GroupBox title="Customer Reviews">
                    {product.reviews && product.reviews.length > 0 ? (
                      <div style={{ maxHeight: 260, overflowY: 'auto', background: W.white, border: `1px solid ${W.btnShadow}` }}>
                        {product.reviews.map((review, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '6px 8px',
                              borderBottom: i < product.reviews!.length - 1 ? `1px solid ${W.lightGray}` : 'none',
                              background: i % 2 === 0 ? W.white : '#f5f5f5',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                              <span style={{ fontSize: 11, fontWeight: 'bold', fontFamily: 'Tahoma, Arial, sans-serif' }}>
                                👤 {review.name}
                              </span>
                              <span style={{ fontSize: 12, color: '#ff8800' }}>
                                {[...Array(5)].map((_, k) => (
                                  <span key={k} style={{ color: k < review.rating ? '#ff8800' : '#cccccc' }}>★</span>
                                ))}
                              </span>
                            </div>
                            <p style={{ fontSize: 11, color: W.black, margin: 0, lineHeight: 1.4, fontFamily: 'Tahoma, Arial, sans-serif' }}>
                              {review.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          background: W.white,
                          border: `1px solid ${W.btnShadow}`,
                          padding: '16px 8px',
                          textAlign: 'center',
                          fontSize: 11,
                          color: W.darkGray,
                          fontFamily: 'Tahoma, Arial, sans-serif',
                        }}
                      >
                        📝 No reviews yet. Be the first to review!
                      </div>
                    )}
                  </GroupBox>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer links */}
          <div
            style={{
              marginTop: 8,
              padding: '4px 0',
              borderTop: `1px solid ${W.btnShadow}`,
              fontSize: 10,
              fontFamily: 'Tahoma, Arial, sans-serif',
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            {['Privacy Policy', 'Terms of Use', 'Contact Us', 'Help Center', 'Return Policy'].map(lnk => (
              <a
                key={lnk}
                href="#"
                style={{ color: W.link, fontSize: 10 }}
                onMouseEnter={e => { (e.target as HTMLAnchorElement).style.color = W.errorRed; }}
                onMouseLeave={e => { (e.target as HTMLAnchorElement).style.color = W.link; }}
              >
                {lnk}
              </a>
            ))}
            <span style={{ marginLeft: 'auto', color: W.darkGray }}>
              © 2000 Haiders Mart. All Rights Reserved. Best viewed in Internet Explorer 5.5+
            </span>
          </div>
        </div>

        <StatusBar text={statusText} />
      </div>

      {/* Outside window label */}
      <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: W.white, fontFamily: 'Tahoma, Arial, sans-serif', opacity: 0.7 }}>
        Haiders Mart Shopping Portal — Windows 2000 Edition
      </div>
    </div>
  );
}
