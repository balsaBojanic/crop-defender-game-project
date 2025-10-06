# Crop defender

You have crops, which you have to take care of on a timer, while also defending your walls from angry crop thieves. Stressing attention dividing between defending your walls before they fall, while also defending your crops. Player wins if they survive a certain amount of time depending on difficulty chosen.

## Game design
	-Three crop boxes which need to be watered every so often (different difficulty means different crops timer or maybe extra tending that needs to be done)
	-5 walls which will be under constant attack from crop thieves(health points of the walls and number of thieves will be adjusted to difficulty)
	-a timer and a crop quote required to win(also adjusted based on difficulty)
	-playable character who will be defending and tending to the crops
-------------------------------------------------------
![img](https://github.com/balsaBojanic/crop-defender-game-project/blob/main/Screenshot%202025-10-06%20at%2009.28.43.png?raw=true)
-------------------------------------------------------
## Gameplay:
	You’re a farmer and a guardian, you have to meet a quote of crops successfully grown or your farm fails. You have to constantly tend to the crops otherwise they die, lowering the yield of this harvest. While tending to your crops you will be under constant attack from crop thieves who will try to breach your defenses, if the thieves are successful at breaking a wall you instantly lose two of your precious crops, again lowering your yield. If you lose enough crops to not be able to meet your required quote the game ends and you lose, otherwise if you manage to defend and tend you win and successfully meet this quote, think about and use your limited time wisely



## Problems
	1.Character movement(have to make a choice will there be diagonal 	       			   movement or just grid gliding)
	2.Handling health and water timers for each individual element on screen
	3.Handling different actions(tending shooting maybe repairing walls)
	4.Handling broken walls and dead crops(make the code stop caring about 			   them)
## Plan:
	-Make a database containing images for elements and their respective attributes 
	-Would be useful to find a designer to make said images and hopefully only 			  costs me a coffee