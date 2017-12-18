# Complaince Trainer

The project was made as a Capstone project for John Carroll Universities BS: Computer Science Degree
The following was used in the project:
	ASP.NET c# MVC 5
	SQL - Microsoft Management Studios with Entity Framework
	Angular.js When Applicable
	Bootstrap
	JQuery + Datatables
	
In order to implement this project on a personal computer you must create the database and add it to Visual Studio via entity framework.
The script file 'Master' to create this is included in the queries.

This project is made for xxxxxxxxxxx to be able to track the trainings of each of their employees without having to email HR.
The main purposes of this project will be for xxxxxxxxxxx  to be able to:
  1. Have its managers be able to view their employee training progresses.
  2. Have HR create and manage trainings.
  3. Have employees be able to view trainings, download training files, and take quizzes.

Two Version of the code exist in the project. The initial current commit uses non-active directory code. If the implementor 
would like to use active directory then the code in between the "Active Directory Code" comments is what needs to be used. 
Also commenting out the code in between the "non-active directory code". 

*** Update to this above
	There is a validate function in the validation helper class which is only used by local (non AD) testing
	There is a block of code which looks like the above explanation, in the training controller. This is only 1 method but does need 		to be uncommented in order for Active Driectry code to work properly.
	In the Home controller there are several items:
		The Login method is commented out and replaced with a simple method instead of actual validation
		There are 2 peices of code which have comments like the above description as well. These are not full methods
			but instead peices of the Index method which calls different functions depanding if you are connected
			to active directory or not. 




