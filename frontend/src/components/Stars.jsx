import { Star } from "lucide-react";

export function Stars({ title, score = 0, onRate, disabled = false }) {
  return (
    <div className="stars" aria-label={`Nota atual de ${title}: ${score || "não avaliado"}`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          className={`star-button ${value <= score ? "filled" : ""}`}
          aria-label={`Avaliar ${title} com ${value} ${value === 1 ? "estrela" : "estrelas"}`}
          title={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
          onClick={() => onRate(value)}
          disabled={disabled}
        >
          <Star size={19} fill={value <= score ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}
