/**
 * Récupère la date en string (DD/MM/YY) via une date
 *
 * @export
 * @param {*} date Date
 * @returns
 */
export function getDate(date){
    var dateObjt= new Date(date);

    return dateObjt.getDay() + "/" + dateObjt.getMonth() + "/" + dateObjt.getFullYear()
  }

/**
 * Récupére l'heure (HH:MM) via une date
 *
 * @export
 * @param {*} date Date
 * @returns
 */
export function getTime(date){
    var dateObjt= new Date(date);

    return dateObjt.getHours() + ":" + dateObjt.getMinutes()
  }


/**
 * Suprime les doublons d'une liste en ajout le nombre de fois ou ils étaient présent 
 * à la valeur unique
 *
 * @export
 * @param {*} list
 * @returns
 */
export function getListItem(list){
    const unique = [];

    list.forEach(element => {
      if(!unique.find(elt => elt.ID == element.ID)){
        element.number=1;
        unique.push(element)
      } else {
        const i = unique.findIndex(elt => elt.ID == element.ID);
        if(i != -1) unique[i].number++
      }
    });

    return unique;
  }

  