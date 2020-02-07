package snakeed;

import java.awt.Dimension;
import java.util.ArrayList;
import java.awt.Point;

public class Snake{
    
    private int snakeType = 0;
    private ArrayList<Direction> segDirection;
    private ArrayList<Point> segLocation;
    private Direction movingDirection;
    private int snakeLength = 0;
    
    private ArrayList<Tile> tiles;
    private boolean secondFrame;
    
    public Snake(Direction d, Point start, int length){
        movingDirection = d;
        segLocation = new ArrayList<>();
        segDirection = new ArrayList<>();
        tiles = new ArrayList<>();
        snakeLength = length - 1;
        
        for(int i = 0; i < length; i++){
            int x = start.x;
            int y = start.y;
            
            switch(movingDirection){
                case UP:
                    y += i;
                    
                    break;
                case DOWN:
                    y -= i;
                    
                    break;
                case LEFT:
                    x += i;
                   
                    break;
                case RIGHT:
                    x -= i;
                    
                    break;
            }
            segLocation.add(new Point(x,y));
            segDirection.add(movingDirection);
         
        }
        getTiles();
    }
    
    public Snake(Direction d, Point start, int length, int type){
        this(d,start,length);
        setSnakeType(type);
    }
    
    public Snake(){
        segLocation = new ArrayList<>();
        segDirection = new ArrayList<>();
        tiles = new ArrayList<>();
    }
    
    public void setMovingDirection(Direction d){
        movingDirection = d;
        
    }
    
    public void advanceSnake(){
        Point tempP;
        segLocation.remove(snakeLength);
        
        switch (movingDirection) {
            case UP:
                tempP = segLocation.get(0);
                segLocation.add(0, new Point(tempP.x, (tempP.y - 1)));
                break;
            case DOWN:
                tempP = segLocation.get(0);
                segLocation.add(0, new Point(tempP.x, (tempP.y + 1)));
                break;
            case LEFT:
                tempP = segLocation.get(0);
                segLocation.add(0, new Point((tempP.x - 1), tempP.y));
                break;
            case RIGHT:
                tempP = segLocation.get(0);
                segLocation.add(0, new Point((tempP.x + 1), tempP.y));
                break;
        }
        
        
        segDirection.remove(segDirection.size() - 1);
        switch (segDirection.get(0)) {
            case UP:
                switch(movingDirection){
                    case UP:
                        segDirection.add(0, Direction.UP);
                        break;
                    case LEFT:
                        segDirection.add(0, Direction.LEFT);
                        segDirection.set(1, Direction.UP_L);
                        break;
                    case RIGHT:
                        segDirection.add(0, Direction.RIGHT);
                        segDirection.set(1, Direction.UP_R);
                        break;
                }
                break;
                
            case DOWN:
                switch(movingDirection){
                    case DOWN:
                        segDirection.add(0, Direction.DOWN);
                        break;
                    case LEFT:
                        segDirection.add(0, Direction.LEFT);
                        segDirection.set(1, Direction.DOWN_L);
                        break;
                    case RIGHT:
                        segDirection.add(0, Direction.RIGHT);
                        segDirection.set(1, Direction.DOWN_R);
                        break;
                }
                break;
              
            case LEFT:
                switch(movingDirection){
                    case LEFT:
                        segDirection.add(0, Direction.LEFT);
                        break;
                    case UP:
                        segDirection.add(0, Direction.UP);
                        segDirection.set(1, Direction.L_UP);
                        break;
                    case DOWN:
                        segDirection.add(0, Direction.DOWN);
                        segDirection.set(1, Direction.L_DOWN);
                        break;
                }
                break;
                
            case RIGHT:
                switch(movingDirection){
                    case RIGHT:
                        segDirection.add(0, Direction.RIGHT);
                        break;
                    case UP:
                        segDirection.add(0, Direction.UP);
                        segDirection.set(1, Direction.R_UP);
                        break;
                    case DOWN:
                        segDirection.add(0, Direction.DOWN);
                        segDirection.set(1, Direction.R_DOWN);
                        break;
                }
                break;
        }
        
        secondFrame = !secondFrame;
    }
    
    public boolean isCollision(ArrayList<Point> obstacles){        
        boolean collision = false;
        
        for(Point p: obstacles){
            if(p.equals(segLocation.get(0))){
                collision = true;
            }
        }
        
        for(int i = 1; i < segLocation.size(); i++){
            if(segLocation.get(0).equals(segLocation.get(i))){
                collision = true;
            }
        }
        return collision;
    }
    
    
    public Collectable checkIfGotCollectable(ArrayList<Collectable> collectables) {
        Collectable c = null;
        
        for(Collectable col: collectables){
            if(getHeadPosition() == col.getLocation()){
                c = col;
            }
        }
        
        return c;
    }   
    
    public void growSnake(){
        segLocation.add(segLocation.size() - 1, segLocation.get(segLocation.size()-1));
        segDirection.add(segDirection.size() - 1, segDirection.get(segDirection.size() - 1));
        snakeLength++;
    }
    
    public ArrayList<Tile> getTiles(){
        int i = 0;
        int tileX = 0;
        int tileY = 0;
        tiles.clear();
        
        for(Direction d: segDirection){
            switch(d){
                    case UP: //head up
                        if(i == 0){
                            tileX = 4;
                            tileY = 0;
                        }
                        else if(i == snakeLength){
                            tileX = 4;
                            tileY = 3;
                            
                        }
                        else{
                            tileX = 4;
                            tileY = 1;
                            
                        }
                        
                        if(secondFrame){
                            tileX += 1;
                            if(!((i - 1) % 2 == 0) && i == snakeLength){
                            tileX -= 1;
                            }
                        }
                        else{
                            if(!((i - 1) % 2 == 0) && i == snakeLength){
                            tileX += 1;
                            }
                        }
            
                        break;
                    case DOWN: 
                        if(i == 0){ //head
                            tileX = 10;
                            tileY = 0;
                            if(secondFrame){
                            tileX += 1;
                            }
                        }
                        else if(i == snakeLength){ //tail
                            tileX = 10;
                            tileY = 3;
                            if(secondFrame){
                            tileX += 1;
                                if(!((i - 1) % 2 == 0) && i == snakeLength){
                                tileX -= 1;
                                }
                            }
                            else{
                                if(!((i - 1) % 2 == 0) && i == snakeLength){
                                tileX += 1;
                                }
                            }
                        }
                        else{ //body
                            tileX = 5;
                            tileY = 1;
                            if(secondFrame){
                            tileX -= 1;
                            }
                        }
                        break;
                    case LEFT: //left
                         if(i == 0){ //head
                            tileX = 6;
                            tileY = 0;
                        }
                        else if(i == snakeLength){ //tail
                            tileX = 6;
                            tileY = 3;
                        }
                        else{ //body
                            tileX = 6;
                            tileY = 1;
                            
                        }
                        if(secondFrame){
                            tileX += 1;
                            if(!((i - 1) % 2 == 0) && i == snakeLength){
                            tileX -= 1;
                            }
                        }
                        else{
                            if(!((i - 1) % 2 == 0) && i == snakeLength){
                            tileX += 1;
                            }
                        }
                        break;
                    case RIGHT: //right
                        if(i == 0){ //head
                            tileX = 8;
                            tileY = 0;
                            if(secondFrame){
                            tileX += 1;
                            }
                        }
                        else if(i == snakeLength){ //tail
                            tileX = 8;
                            tileY = 3;
                            if(secondFrame){
                            tileX += 1;
                                if(!((i - 1) % 2 == 0) && i == snakeLength){
                                tileX -= 1;
                                }
                            }
                            else{
                                if(!((i - 1) % 2 == 0) && i == snakeLength){
                                tileX += 1;
                                }
                            }
                        }
                        else{ //body
                            tileX = 7;
                            tileY = 1;
                            if(secondFrame){
                            tileX -= 1;
                            }
                        }
                        break;
                    
                    case UP_L: //up left
                        if(i == snakeLength){ //tail
                            tileX = 6;
                            tileY = 3;
                            if(secondFrame){
                            tileX += 1;
                            }
                        }
                        else{ //body
                            tileX = 9;
                            tileY = 1;
                        }
                        
                        break;
   
                    case UP_R: //up right
                        if(i == snakeLength){ //tail
                            tileX = 8;
                            tileY = 3;
                            if(secondFrame){
                            tileX += 1;
                            }
                        }
                        else{ //body
                            tileX = 8;
                            tileY = 1;
                        }

                        break;
   
                    case DOWN_L: 
                        if(i == snakeLength){ //tail
                            tileX = 6;
                            tileY = 3;
                            if(secondFrame){
                            tileX += 1;
                            }
                        }
                        else{ //body
                            tileX = 10;
                            tileY = 1;
                        }
                        
                        break;
                        
                    case DOWN_R:
                        if(i == snakeLength){ //tail
                            tileX = 8;
                            tileY = 3;
                            if(secondFrame){
                            tileX += 1;
                            }
                        }
                        else{ //body
                            tileX = 11;
                            tileY = 1; 
                        }

                        break;
                        
                    case L_UP: 
                        if(i == snakeLength){ //tail
                            tileX = 4;
                            tileY = 3;
                            if(secondFrame){
                            tileX += 1;
                            }
                        }
                        else{ //body
                            tileX = 11;
                            tileY = 1;
                        }
                        
                        break;
   
                    case R_UP: 
                        if(i == snakeLength){ //tail
                            tileX = 4;
                            tileY = 3;
                            if(secondFrame){
                            tileX += 1;
                            }
                        }
                        else{ //body
                            tileX = 10;
                            tileY = 1;
                        }

                        break;
   
                    case L_DOWN:
                        if(i == snakeLength){ //tail
                            tileX = 10;
                            tileY = 3;
                            if(secondFrame){
                            tileX += 1;
                            }
                        }
                        else{ //body
                            tileX = 8;
                            tileY = 1;
                        }
                        
                        break;
                        
                    case R_DOWN: 
                        if(i == snakeLength){ //tail
                            tileX = 10;
                            tileY = 3;
                            if(secondFrame){
                            tileX += 1;
                            }
                        }
                        else{ //body
                            tileX = 9;
                            tileY = 1; 
                        }

                        break;
            }
            
            if(i > 0 && i < snakeLength){
                if((i % 2 == 0)){
                    tileY += 1;
                }
            }
            
            tiles.add(new Tile(segLocation.get(i),
                        new Point(tileX,tileY+snakeType*4))
                        );
            i++;
        }
        return tiles;
    }
    
    public Point getHeadPosition(){
        return segLocation.get(0);
    }

    public ArrayList<Direction> getSegmentDirection(){
        return segDirection;
    }
    
    public ArrayList<Point> getSegmentLocation(){
        return segLocation;
    }
    
    public Direction getCurrentMovingDirection(){
        return movingDirection;
    }
	
	public Direction getInverseMovingDirection(){
		Direction inverseDirection = null;
		
		switch(movingDirection){
			case UP:
				inverseDirection = Direction.DOWN;
				break;
			case DOWN:
				inverseDirection = Direction.UP;
				break;
			case LEFT:
				inverseDirection = Direction.RIGHT;
				break;
			case RIGHT:
				inverseDirection = Direction.LEFT;
				break;				
		}
		
        return inverseDirection;
    }

    public int getSnakeLength() {
        return snakeLength;
    }

    public int getSnakeType() {
        return snakeType;
    }

    public void setSnakeType(int type) {
        this.snakeType = type;
    }

    @Override
    public String toString() {
        String s = "Snake type: ";
        
        switch(snakeType){
            case 0:
                s += "'Milk-Snake'";
                break;
            case 1:
                s += "'Green-Tree Python'";
                break;
            case 2:
                s += "'Corn Snake'";
                break;
            case 3:
                s += "'Rattlesnake'";
                break;
        }
        
        s += " | Length: " + snakeLength;
        
        return s;
    }
    
    
}
