# decision_theory_solver

Web application for solving the simplest problems of decision theory

## Equations solver
You are required to independently compile a table according to the equations you specified, and also perform further checks when the program asks for it

Example:  
q = x2 - x1  
5 - 0.5\*x2 >= x1 => x3 = 5 - 0.5\*x2 - x1  
4\*x2 - 6 + x1 >= 0 => x4 = 4\*x2 - 6 + x1  

Result:  
|    | 1  | x1 | x2  |
|----|----|----|-----|
| q  | 0  | 1  | -1  |
| x3 | 5  | 1  | 0.5 |
| x4 | -6 | -1 | -4  |

You do not need to specify signs for x1 and x2

## Strategy matrix games solver
So far only in plans