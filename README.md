# aot-experiment

    Decomposition : Breaking down the current question into a dependency-based Directed Acyclic Graph (DAG).
    Contraction : Simplifying the DAG into an independent atomic question while preserving answer equivalence with the original problem.

6. Broader Implications  

    Enhanced Reasoning Capabilities : 
        AOT has the potential to significantly improve the reasoning abilities of LLMs, particularly in tasks requiring multi-hop reasoning.
         

    Optimized Resource Allocation : 
        By eliminating historical dependencies, AOT enables more efficient use of computational resources, making it suitable for resource-constrained environments.
         

    Future Research Directions : 
        Incorporating reflection mechanisms to improve robustness.
        Exploring the application of AOT to other domains, such as natural language understanding and code generation.
         
1. Initial Question Setup  

    Input : The algorithm starts with an initial question Q0​, which represents the problem to be solved.
    Goal : Decompose Q0​ into simpler subquestions and iteratively simplify it until it becomes directly solvable.
     

2. Iterative Decomposition and Contraction  

The core of AOT involves two main phases: decomposition  and contraction , which are repeated iteratively. 
a) Decomposition Phase  

    Generate a Dependency-Based Directed Acyclic Graph (DAG) : 
        Use a Large Language Model (LLM) to break down the current question Qi​ into a set of subquestions.
        Represent these subquestions as nodes in a Directed Acyclic Graph (DAG) , where edges indicate dependencies between subquestions.
        Subquestions are categorized into:
            Independent subquestions (Qind​) : Nodes without incoming edges (no dependencies).
            Dependent subquestions (Qdep​) : Nodes with incoming edges (dependent on other subquestions).
             
         

    Extract Structural Information : 
        The DAG captures rich structural information about the relationships between subquestions, enabling efficient simplification in the next phase.
         
     

b) Contraction Phase  

    Simplify the DAG : 
        Treat the results of Qind​ as known conditions or eliminate them as incorrect explorations.
        Contract Qdep​ into a new independent question Qi+1​ while preserving answer equivalence with the original problem.
         

    Formulate the Next Atomic Question : 
        The contracted question Qi+1​ is a simplified version of Qi​, focusing only on the current reasoning state and eliminating unnecessary historical dependencies.
         
     

3. Iteration Until Termination  

    The decomposition-contraction process repeats iteratively, producing a sequence of atomic questions Q0​,Q1​,Q2​,…,QD​, where D is the maximum depth determined by the complexity of the problem.
    Each iteration reduces the complexity of the reasoning process while maintaining the Markov property.
     

4. Termination Mechanism  

    Automated Evaluation :
        After each contraction step, an LLM evaluates the solution quality by comparing the execution results of the original question Qi​, the decomposed DAG structure Gi​, and the contracted question Qi+1​.
        If the synthesized answer from Qi+1​ demonstrates consistency with the answer produced by Qi​, the iterative process continues.
         
    Final Solution :
        Upon termination, the algorithm combines the current contracted question QD​ with the union of all independent subquestions Qdep​ accumulated from previous iterations to form a complete solution to the initial question Q0​.
         
     

5. Integration with Existing Methods  

    Plug-In Enhancement :
        AOT can serve as a preprocessing module for existing test-time scaling methods (e.g., Chain-of-Thought, Tree-of-Thoughts).
        Any intermediate state Qi​ from the Markov process can serve as an entry point for other methods, enabling flexible composition while maintaining answer equivalence with the original question.
         
     

6. Final Answer Generation  

    Once the reasoning process reaches the final atomic question QD​, the LLM generates the final answer A by solving QD​.
     