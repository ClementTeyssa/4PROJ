import React, { Component } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CoursesList from '../Components/Smart/OldCoursesList/CoursesList';
import CoursesListDetail from '../Components/Smart/OldCoursesList/CoursesListDetail';

const ShoppingModeStackNavigator = createStackNavigator();

export default class ShoppingListsStack extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
        <ShoppingModeStackNavigator.Navigator
          headerMode={false}>
          <ShoppingModeStackNavigator.Screen
            name="Listes de courses"
            component={CoursesList} />
          <ShoppingModeStackNavigator.Screen
            name="Detail Liste"
            component={CoursesListDetail} />
        </ShoppingModeStackNavigator.Navigator>
    );
  }
}
