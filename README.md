AoT-Experiment: Atom of Thoughts for Markov LLM Test-Time Scaling
=================================================================

This project is an experiment in implementing the **Atom of Thoughts (AOT)** framework within a [T3](https://create.t3.gg/) Next.js application to explore **Markov-style reasoning** and **Test-Time Scaling** for Large Language Models (LLMs). The goal is to break down complex reasoning into atomic steps while leveraging efficient computation during inference.

* * * * *

🧠 What is Atom of Thoughts (AOT)?
----------------------------------

The **Atom of Thoughts (Aot)**

Paper: <https://arxiv.org/abs/2502.12018>

1.  **Decomposition** : Breaking down the problem into smaller sub-problems.
2.  **Merging** : Combining results from each atomic step into a coherent final output.

Additionally, it models dependencies between sub-tasks using a **Directed Acyclic Graph (DAG)** to ensure logical flow and dependency tracking.

* * * * *

🔧 Features
-----------

-   ✅ T3 stack (Next.js + TypeScript + Tailwind CSS + tRPC)
-   🤖 Integration with LLMs for test-time scaling
-   ⚡ Atomic decomposition and merging logic for reasoning tasks
-   📊 DAG-based visualization of thought dependencies
-   🧪 Example prompts and workflows for testing AOT behavior

* * * * *

🛠️ Tech Stack
--------------

-   [Next.js](https://nextjs.org/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [tRPC](https://trpc.io/)
-   [Zod](https://zod.dev/) for schema validation
-   [React Flow](https://reactflow.dev/) for visualizing DAGs
-   Optional: Integration with HuggingFace or OpenAI APIs for LLM inference
