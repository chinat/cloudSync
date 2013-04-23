#ifndef UTILS_H
#define UTILS_H

#include <QStringList>
#include <QMetaType>
#include <QMap>
#include <QMapIterator>
#include <QVariant>


//using Map = QMap<QByteArray, QByteArray>;
typedef QMap<QByteArray, QVariant> Map;
Q_DECLARE_METATYPE(Map)

/**
  * conv stringlist to string
  */
auto listTJson = [](QStringList list)-> QString{
    QString ret="[";
    for(QString item: list) {
        ret.append(QString("\"%1\",").arg(item));
    }
    ret.replace(ret.length() - 1, 1, QChar(']'));
    return ret;
};

/**
  * conv map to string
  */
//auto mapTJson = [](QMap<QByteArray, QVariant> map) -> QByteArray {
//    QByteArray ret{"{"};
//    QMapIterator<QByteArray, QVariant> iterator(map);
//    while(iterator.hasNext()) {
//        iterator.next();
//        QVariant value = iterator.value();
//        switch(value.type()) {
//        case QVariant::Map: 
//            ret += QString("\"%1\":%2,").arg(iterator.key()).arg(mapTJson(value)).toLatin1();
//            break;
//        case QVariant::List: 
//            ret += QString("%1:%2,").arg(iterator.key()).arg(listTJson(value)).toLatin1();
//            break;
//        case QVariant::Date:
//        case QVariant::Time:
//        case QVariant::DateTime:
//            ret += QString("%1:%2,").arg(iterator.key()).arg(value.toString()).toLatin1();
//            break;
//        default:
//            ret += QString("%1:%2,").arg(iterator.key()).arg(value).toLatin1();
//            break;
//        }
//    }
//    ret[ret.length() - 1] = '}';
//    return ret;
//};


#endif // UTILS_H
