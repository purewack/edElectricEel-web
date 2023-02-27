/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed;

import java.awt.Dimension;
import java.awt.Point;
import java.awt.Rectangle;
import java.util.ArrayList;

public class Collectable extends Tile{
    
    public enum CollectableType {
    //Main types
    TYPE_LETTER, TYPE_NUMBER, TYPE_SYMBOL, TYPE_ITEM,
    }
    
    private CollectableType type;
    private int pointsWorth = 0;
    private int valueNumber;
    private char valueLetter;
    private CollectableType valueOther;
    
    public Collectable(CollectableType t, Point loc){
        super(loc);
        type = t;
    }
    
    public void setType(CollectableType t){
        type = t;
    }
    
    public void setPointsWorth(int points){
        pointsWorth = points;
    }

    public void setValue(int number){
        valueNumber = number;
    }
    
    public void setValue(char letter){
        valueLetter = letter;
    }

    public void setValue(CollectableType other){
        valueOther = other;
    }

    public CollectableType getType(){
        return type;
    }
    
    public int getPointsWorth(){
        return pointsWorth;
    }
    
    public int getValueNumber(){
        return valueNumber;
    }
    
    public char getValueLetter(){
        return valueLetter;
    }
    
    public CollectableType getValueOther(){
        return valueOther;
    }
    
    public Tile getTile(){
        return (Tile)this;
    }

    public boolean equals(Collectable c) {
       boolean equals = false;
       
       if(c.getType() == this.getType()){
            if(c.getValueOther() == this.getValueOther()){
                if(c.getLocation() == super.getLocation()){
                    equals = true;
                }
            }
       }
       
       return equals;
    }
    
}