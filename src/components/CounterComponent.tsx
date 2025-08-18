import React from "react";
import { useCounter } from "../hooks/useCounter";

const CounterComponent: React.FC = () => {
  const counter = useCounter();

  return (
    <div className="card">
      <h2>Redux Counter: {counter.value}</h2>
      {counter.loading && <p>Loading...</p>}
      {counter.error && <p style={{ color: "red" }}>Error: {counter.error}</p>}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <button onClick={counter.increment}>Increment</button>
        <button onClick={counter.decrement}>Decrement</button>
        <button onClick={() => counter.incrementByAmount(5)}>+5</button>
        <button
          onClick={() => counter.incrementAsync(3)}
          disabled={counter.loading}
        >
          {counter.loading ? "Loading..." : "Async +3"}
        </button>
        <button onClick={() => counter.fetchValue()} disabled={counter.loading}>
          {counter.loading ? "Loading..." : "Fetch Random"}
        </button>
        <button onClick={counter.reset}>Reset</button>
      </div>
    </div>
  );
};

export default CounterComponent;
